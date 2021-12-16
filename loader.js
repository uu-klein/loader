const translate = require("@vitalets/google-translate-api");

module.exports = function(source) {
  const callback = this.async();

  let reg = /[\u4e00-\u9fa5]+/g;

  let match = source.match(reg);

  if (match !== null && match !== "null") {
    let str = match.join(",");

    if (str !== null) {
      translate(str, {
        to: "vi"
      })
        .then(res => {
          let regRes = /\'|'|'/g;

          let newRes = res.text.replace(regRes, "").split(/, */);

          let newArr = str.split(/, */);

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
  }
};
