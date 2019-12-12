import moment from "moment";

export const initialState = {
  filterConditions: {
    deviceId: "",
    beginTime: moment().startOf("day"),
    endTime: moment().startOf("day")
  },
  tasks: [],
  loading: false
};