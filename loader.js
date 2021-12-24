
const translate = require("@vitalets/google-translate-api");

class AsyncSeriesHook {
  constructor(val) {
    this.tasks = [];
    this.val = val;
    this.res = "";
  }
  promise(...args) {
    let [o, ...funs] = this.tasks;
    return funs.reduce((a, b) => a.then(() => b(...args)), o(...args));
  }
  tapPromise(task) {
    this.tasks.push(task);
  }
}

module.exports = function(source) {
  const callback = this.async();

  let fn = new AsyncSeriesHook(source);

  fn.tapPromise(val => {
    return new Promise(resolve => {
      let reg = /[\u4e00-\u9fa5]+/g;
      let match = val.match(reg);
      if (match !== null && match !== "null") {
        let str = match.join(",");
        fn.val = str;
        resolve();
      }
    });
  });

  fn.tapPromise(() => {
    return new Promise(resolve => {
      const { val } = fn;
      if (val !== null) {
        translate(val, {
          to: "vi"
        })
          .then(res => {
            fn.res = res;
            resolve();
          })
          .catch(err => {
            console.error(err);
          });
      }
    });
  });

  fn.tapPromise(source => {
    const { res, val } = fn;
    return new Promise(resolve => {
      let regRes = /\'|'|'/g;
      let newRes = res.text.replace(regRes, "").split(/, */);
      let newArr = val.split(/, */);
      for (let index = 0; index < newArr.length; index++) {
        let res = `${newRes[index]}`;
        let reg = new RegExp(`${newArr[index]}`, "g");
        source = source.replace(reg, res);
      }
      callback(null, source);
      resolve();
    });
  });

  fn.promise(source);
};
