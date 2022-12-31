export abstract class BaseCloudFunction<TFuncReturnType> {
    abstract run(request: Parse.Cloud.FunctionRequest<Parse.Cloud.Params>): Promise<TFuncReturnType>;
}