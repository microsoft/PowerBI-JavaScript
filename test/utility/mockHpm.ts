export const spyHpm = {
  get: jasmine.createSpy("get").and.returnValue(Promise.resolve(null)),
  post: jasmine.createSpy("post").and.returnValue(Promise.resolve(null)),
  patch: jasmine.createSpy("patch").and.returnValue(Promise.resolve(null)),
  put: jasmine.createSpy("put").and.returnValue(Promise.resolve(null)),
  delete: jasmine.createSpy("delete").and.returnValue(Promise.resolve(null))
};