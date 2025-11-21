import { jest } from "@jest/globals";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type AsyncFunction = (...args: any) => Promise<unknown>;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type Fun = (...args: any) => unknown;

// `keyof` returns the keys of the given object type, except for keys of type `never`
type KeyOfType<T, V> = keyof {
	// All keys P that do not match the type V will be replaced by `never`
	[P in keyof T as T[P] extends V ? P : never]: unknown;
};

type AwaitedReturnOfFunctionOfType<T, F extends keyof T> = T[F] extends AsyncFunction
	? Awaited<ReturnType<T[F]>>
	: never;
type ReturnOfFunctionOfType<T, F extends keyof T> = T[F] extends Fun ? ReturnType<T[F]> : never;

/*
  We wrap the value param type in a 1-tuple to get control over when the param is required or not.
  In essence, we're looking for the same behavior as optional params (`param?: any`), but rather than being generally
  optional we want the parameter to be required or not based on the function's other parameters.
*/
type AsyncReturnTypeTuple<T, F extends KeyOfType<T, AsyncFunction>> = AwaitedReturnOfFunctionOfType<
	T,
	F
> extends void
	? []
	: [AwaitedReturnOfFunctionOfType<T, F>];
type SyncReturnTypeTuple<T, F extends KeyOfType<T, Fun>> = ReturnOfFunctionOfType<T, F> extends void
	? []
	: [ReturnOfFunctionOfType<T, F>];

function mockModuleFunction<M, F extends KeyOfType<M, Fun>>(module: M, fun: F): jest.Mock<Fun> {
	if (!jest.isMockFunction(module[fun])) {
		module[fun] = jest.fn() as M[F];
	}

	return module[fun] as jest.Mock;
}

function mockAsyncModuleFunction<M, F extends KeyOfType<M, AsyncFunction>>(
	module: M,
	fun: F,
): jest.Mock<AsyncFunction> {
	if (!jest.isMockFunction(module[fun])) {
		module[fun] = jest.fn() as M[F];
	}

	return module[fun] as jest.Mock<AsyncFunction>;
}

/*
  The V type is necessary because while KeyOfType<M, AsyncFunction> asserts that
  F is a key of M, typescript isn't able to infer that it also matches AsyncFunction.

  Therefore, we need another conditional type (which we know will always be true)
  to remake that assertion and prevent typescript from complaining that we might
  be trying to get the return type of a non-function type
 */
export function mockResolvedValue<M, F extends KeyOfType<M, AsyncFunction>>(
	module: M,
	fun: F,
	...params: AsyncReturnTypeTuple<M, F>
): void {
	const [value] = params;
	const mockedFunction = mockAsyncModuleFunction(module, fun);
	mockedFunction.mockResolvedValue(value) as M[F];
}

export function mockResolvedValueOnce<M, F extends KeyOfType<M, AsyncFunction>>(
	module: M,
	fun: F,
	...params: AsyncReturnTypeTuple<M, F>
): void {
	const [value] = params;
	const mockedFunction = mockAsyncModuleFunction(module, fun);
	mockedFunction.mockResolvedValueOnce(value) as M[F];
}

export function mockBlockedPromise<M, F extends KeyOfType<M, AsyncFunction>>(
	module: M,
	fun: F,
): void {
	const mockedFunction = mockAsyncModuleFunction(module, fun);
	mockedFunction.mockImplementation(() => new Promise(() => undefined)) as M[F];
}

export function mockBlockedPromiseOnce<M, F extends KeyOfType<M, AsyncFunction>>(
	module: M,
	fun: F,
): void {
	const mockedFunction = mockAsyncModuleFunction(module, fun);
	mockedFunction.mockImplementationOnce(() => new Promise(() => undefined)) as M[F];
}

export function mockRejectedValue<M, F extends KeyOfType<M, AsyncFunction>>(
	module: M,
	fun: F,
	value?: unknown,
): void {
	const mockedFunction = mockAsyncModuleFunction(module, fun);
	mockedFunction.mockRejectedValue(value ?? new Error());
}

export function mockRejectedValueOnce<M, F extends KeyOfType<M, AsyncFunction>>(
	module: M,
	fun: F,
	value?: unknown,
): void {
	const mockedFunction = mockAsyncModuleFunction(module, fun);
	mockedFunction.mockRejectedValueOnce(value ?? new Error());
}

export function mockReturnValue<M, F extends KeyOfType<M, Fun>>(
	module: M,
	fun: F,
	...params: SyncReturnTypeTuple<M, F>
): void {
	const [value] = params;
	const mockedFunction = mockModuleFunction(module, fun);
	mockedFunction.mockReturnValue(value) as M[F];
}

export function clearMock<M, F extends KeyOfType<M, Fun>>(module: M, fun: F): void {
	const mockedFunction = mockModuleFunction(module, fun);
	mockedFunction.mockClear();
}

export function mockKeys<T extends object>(obj: T): T {
	return Object.keys(obj).reduce((acc, cur) => {
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		acc[cur as keyof T] = jest.fn() as any;
		return acc;
	}, {} as T);
}
