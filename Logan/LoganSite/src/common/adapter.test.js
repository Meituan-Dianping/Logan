import {convertBriefsToMinimapBriefs} from "./adapter"

describe("log type data adapter", () => {


  it("should return empty array when given empty brief", () => {
    const ret = convertBriefsToMinimapBriefs([], "native");
    expect(ret).toEqual([]);
  });

  it("should return proper native log type information", () => {
    const ret = convertBriefsToMinimapBriefs([{logType: 1, id: 1, logTime: 111111}], "native");
    expect(ret).toEqual([{
      id: 1,
      time: 111111,
      logType: {
        type: 1,
        logTypeName: "日志类型1",
        displayColor: "#32CD32"
      }
    }]);
  });

  it("should return proper web log type information", () => {
    const ret = convertBriefsToMinimapBriefs([{logType: 1, id: 1, logTime: 111111}], "native");
    expect(ret).toEqual([{
      id: 1,
      time: 111111,
      logType: {
        type: 1,
        logTypeName: "日志类型1",
        displayColor: "#32CD32"
      }
    }]);
  });

  it("should return unknown log type information", () => {
    const ret = convertBriefsToMinimapBriefs([{logType: 1, detailId: 1, logTime: 111111}], "web");
    expect(ret).toEqual([{
      id: 1,
      time: 111111,
      logType: {
        type: 1,
        logTypeName: "日志类型1",
        displayColor: "#32CD32"
      }
    }]);
  })
});