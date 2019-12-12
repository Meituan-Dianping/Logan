import {getPageOfLogIdsBySingleLogId} from "./util";

describe("getPageOfLogIdsBySingleLogId function", () => {
  it("should return all id when num of page equal or less than 3", () => {
    const briefs = [
      // page 1
      {id: 1}, {id: 2}, {id: 3},
      // page 2
      {id: 4}, {id: 5}, {id: 6}
    ];

    expect(getPageOfLogIdsBySingleLogId(briefs, 4)).toEqual([1,2,3,4,5,6]);
  });

  it("should return the first three pages", () => {
    const briefs = [
      // page 1
      {id: 1}, {id: 2}, {id: 3},
      // page 2
      {id: 4}, {id: 5}, {id: 6},
      // page 3
      {id: 7}, {id: 8}, {id: 9},
      // page 4
      {id: 10}, {id: 11}, {id: 12}
    ];

    expect(getPageOfLogIdsBySingleLogId(briefs, 1)).toEqual([1,2,3,4,5,6,7,8,9,10,11,12]);
  });

  it("should return the prev page and the next page 1", () => {
    const briefs = [
      // page 1
      {id: 1}, {id: 2}, {id: 3},
      // page 2
      {id: 4}, {id: 5}, {id: 6},
      // page 3
      {id: 7}, {id: 8}, {id: 9},
      // page 4
      {id: 10}, {id: 11}, {id: 12}
    ];

    expect(getPageOfLogIdsBySingleLogId(briefs, 4)).toEqual([1,2,3,4,5,6,7,8,9,10,11,12]);
  });

  it("should return the prev page and the next page 2", () => {
    const briefs = [
      // page 1
      {id: 1}, {id: 2}, {id: 3},
      // page 2
      {id: 4}, {id: 5}, {id: 6},
      // page 3
      {id: 7}, {id: 8}, {id: 9},
      // page 4
      {id: 10}, {id: 11}, {id: 12}
    ];

    expect(getPageOfLogIdsBySingleLogId(briefs, 7)).toEqual([1,2,3,4,5,6,7,8,9,10,11,12]);
  });


  it("should return the last three pages", () => {
    const briefs = [
      // page 1
      {id: 1}, {id: 2}, {id: 3},
      // page 2
      {id: 4}, {id: 5}, {id: 6},
      // page 3
      {id: 7}, {id: 8}, {id: 9},
      // page 4
      {id: 10}, {id: 11}, {id: 12}
    ];

    expect(getPageOfLogIdsBySingleLogId(briefs, 10)).toEqual([1,2,3,4,5,6,7,8,9,10,11,12]);
  });
});