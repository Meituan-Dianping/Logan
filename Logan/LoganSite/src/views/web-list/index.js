import React, { Component } from "react";
import { connect } from "react-redux";
import { every, some } from "lodash";
import { parse } from "qs";
import moment from "moment";
import ListPage from "../components/list-page/index";
import { updateFilterConditions, fetchTasks, fetchInitData } from "./redux/action";
import {message} from "antd";


export class WebList extends Component {

  componentDidCatch(error, errorInfo) {
    message.error("页面异常！");
    this.props.history.replace("/");
  }

  componentDidMount() {
    const { updateFilterConditions, fetchTasks, fetchInitData } = this.props;

    let params = {};
    if (this.props.location) {
       params = parse(this.props.location.search, { ignoreQueryPrefix: true });
    }

    const { deviceId, beginTime, endTime } = params;
    if (some([deviceId, beginTime, endTime], item => item === void 0) && !every([deviceId, beginTime, endTime], item => item === void 0)) {
      message.warn("url参数错误！获取默认日志列表")
    }
    
    updateFilterConditions({
      deviceId: deviceId ? deviceId : "",
      beginTime: beginTime ? moment(Number.parseInt(beginTime)).valueOf() : moment().startOf("day").subtract(6, 'days').valueOf(),
      endTime: endTime ? moment(Number.parseInt(endTime)).valueOf() : moment().startOf("day").valueOf()
    });

    if (deviceId && beginTime && endTime) {
      fetchTasks({
        deviceId: deviceId,
        beginTime: moment(Number.parseInt(beginTime)).valueOf(),
        endTime: moment(Number.parseInt(endTime)).valueOf()
      });
    } else {
      fetchInitData();
    }
  }

  render() {
    return (
      <ListPage
        {...this.props}
        data-test="ListPage"
        type="web"
        detailUrlPrefix="/web-detail"
      />
    )
  }
}

export function mapStateToProps(state) {
  return {
    ...state.webList
  };
}

export function mapDispatchToProps(dispatch) {
  return {
    updateFilterConditions: newFilterConditions => dispatch(updateFilterConditions(newFilterConditions)),
    fetchTasks: (filterConditions) => dispatch(fetchTasks(filterConditions)),
    fetchInitData: () => dispatch(fetchInitData())
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WebList);