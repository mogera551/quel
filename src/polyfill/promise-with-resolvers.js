
if (typeof Promise.withResolvers === 'undefined') {
  Promise.withResolvers = function () {
    let resolve, reject;
    const promise = new Promise<any>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { 
      promise, 
      resolve, 
      reject
    }
  }

}