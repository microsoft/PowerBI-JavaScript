// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const spyHpm = {
  get: jasmine.createSpy("get").and.returnValue(Promise.resolve({})),
  post: jasmine.createSpy("post").and.returnValue(Promise.resolve({})),
  patch: jasmine.createSpy("patch").and.returnValue(Promise.resolve({})),
  put: jasmine.createSpy("put").and.returnValue(Promise.resolve({})),
  delete: jasmine.createSpy("delete").and.returnValue(Promise.resolve({}))
};
