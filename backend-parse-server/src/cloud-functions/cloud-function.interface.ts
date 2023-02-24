export abstract class BaseCloudFunction<TFuncReturnType> {
    abstract run(request: Parse.Cloud.FunctionRequest<Parse.Cloud.Params> | Parse.Cloud.BeforeSaveRequest<Parse.Object<Parse.Attributes>> | Parse.Cloud.AfterSaveRequest<Parse.Object<Parse.Attributes>> | Parse.Cloud.BeforeDeleteRequest<Parse.Object<Parse.Attributes>>): Promise<TFuncReturnType>;
}
