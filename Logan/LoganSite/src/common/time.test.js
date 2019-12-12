import {stringifyTime} from "./time";


describe("stringifyTime function", () => {
  it("should show milisecond", () => {
    const date = new Date(1573438103079);
    expect(stringifyTime(date, false)).toBe("10:08:23.79")
  });

  it("shouldn't show milisecond", () => {
    const date = new Date(1573438103079);
    expect(stringifyTime(date, true)).toBe("10:08:23")
  })
})