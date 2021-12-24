const translate = require("@vitalets/google-translate-api");

module.exports = function(source) {
  const callback = this.async();

  const compose = (...fun) =>
    fun.reduceRight((a, b) => (...args) => a(b(...args)));

  const matchFn = val => {
    let reg = /[\u4e00-\u9fa5]+/g;

    let match = val.match(reg);

    if (match !== null && match !== "null") {
      let str = match.join(",");
      return str;
    }
  };

  const translateFn = val => {
    if (val !== null) {
      translate(val, {
        to: "vi"
      })
        .then(res => {
          let regRes = /\'|'|'/g;

          let newRes = res.text.replace(regRes, "").split(/, */);

          let newArr = val.split(/, */);

          for (let index = 0; index < newArr.length; index++) {
            let res = `${newRes[index]}`;

            let reg = new RegExp(`${newArr[index]}`, "g");

            source = source.replace(reg, res);
          }
          callback(null, source);
        })
        .catch(err => {
          console.error(err);
        });
    }
  };

  const fn = compose(matchFn, translateFn);

  fn(source);

};
