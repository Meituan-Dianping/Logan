import React, { Component } from "react";
import { connect } from "react-redux";
import { parse } from "qs";

import {
  fetchPageInitData,
  fetchTaskDetail,
  updateFilterConditions,
  updateFocusLogId,
  updateHighLightIndex,
  initState,
  updateSorted
} from "./redux/action";

import LogDetailPage from "../components/log-detail-page/index";
import {message} from "antd";

export function mapStateToProps(state) {
  return {
    ...state.nativeLogDetail,
    nativeListFilterConditions: state.nativeList.filterConditions
  };
}

export function mapDispatchToProps(dispatch) {
  return {
    fetchPageInitData: (taskId, focusLogId) => dispatch(fetchPageInitData(taskId, focusLogId)),
    updateFocusLogId: topLogId => dispatch(updateFocusLogId(topLogId)),
    updateFilterConditions: filterConditions => dispatch(updateFilterConditions(filterConditions)),
    updateHighLightIndex: (start, end) => dispatch(updateHighLightIndex(start, end)),
    fetchTaskDetail: (detailIds, direction) => dispatch(fetchTaskDetail(detailIds, direction)),
    initState: () => dispatch(initState()),
    updateSorted: (sorted) => dispatch(updateSorted(sorted))
  };
}


export class NativeLogDetail extends Component{

  componentDidCatch(error, errorInfo) {
    message.error("页面异常！");
    this.props.history.replace("/");
  }

  componentDidMount() {
    const { initState } = this.props;
    initState();
    let params = {};
    if (this.props.location) {
      params = parse(this.props.location.search, { ignoreQueryPrefix: true });
    }
    const { tasks, focusLogId } = params;
    this.props.fetchPageInitData(tasks, focusLogId);
  }

  render() {
    return (
      <LogDetailPage
        data-test="NativeLogDetailPage"
        {...this.props}
        type="native"
      />
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NativeLogDetail);