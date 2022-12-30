import { AuthenticateWithPhoneNumberFunction } from "./auth/auth-with-phonenumber.function";
import { GetOrCreateUserForPhoneNumberFunction } from "./auth/createOrGetUserForPhoneNumber.function";
import { VerifyAuthChallengeCodeFunction } from "./auth/verify-auth-challenge-code.function";

export const CLOUD_FUNCTION_CLASSES = [AuthenticateWithPhoneNumberFunction, VerifyAuthChallengeCodeFunction, GetOrCreateUserForPhoneNumberFunction];
