var checkDate = date => {
  if (date === "Invalid Date") {
    throw new Error("Invalid Date");
  } else {
    return true;
  }
};

export const stringifyTime = (date, noMiniSec) => {
  checkDate(date);
  let H = date.getHours();
  H = H < 10 ? "0" + H : H;
  let M = date.getMinutes();
  M = M < 10 ? "0" + M : M;
  let S = date.getSeconds();
  S = S < 10 ? "0" + S : S;
  let ss = date % 1000;
  return `${H}${":" + M}${":" + S}${noMiniSec ? "" : "." + ss}`;
};
