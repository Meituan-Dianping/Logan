import React, { Component } from "react";
import { Table, Icon, Button } from "antd";
import moment from "moment";
import "antd/dist/antd.css";
import "./style.scss";
import HeaderBar from "./components/header-bar/index";

const { Column } = Table;

const ICON_BY_PLATFORM = {
  "-1": <span>Unknown</span>,
  "0": (
    <span>
      <Icon type="android" /> | <Icon type="apple" />
    </span>
  ),
  "1": (
    <span>
      <Icon type="android" />
    </span>
  ),
  "2": (
    <span>
      <Icon type="apple" />
    </span>
  )
};

class ListPage extends Component {
  render() {
    const { filterConditions, tasks, updateFilterConditions, fetchTasks, loading, type } = this.props;
    return (
      <div className={"listpage-container"}>
        <HeaderBar
          filterConditions={filterConditions}
          updateFilterConditions={updateFilterConditions}
          fetchTasks={fetchTasks}
          type={type}
        />
        <div className={"table-container"}>
            {
              (() => {
                if (type === "native") {
                  return this.renderNativeColumns(tasks, loading);
                } else if (type === "web") {
                  return this.renderWebColumns(tasks, loading);
                }
              })()
            }
        </div>
      </div>
    );
  }

  renderNativeColumns = (tasks, loading) => {
    return (
      <Table size="middle" dataSource={tasks} loading={loading} pagination={false} scroll={{y: 650}} rowKey="taskId">
        <Column title="任务id" dataIndex="taskId" key="taskId" width="10%" />
        <Column title="AppId" dataIndex="appId" key="appId" width="10%"/>
        <Column title="AppVersion" dataIndex="appVersion" key="appVersion" width="10%"/>
        <Column title="设备标识" dataIndex="deviceId" key="deviceId" width="15%" />
        <Column title="unionId" dataIndex="unionId" key="unionId" width="15%" />
        <Column title="设备平台" dataIndex="platform" key="platform" width="10%" render={this.renderColumnPlatform} />
        <Column title="日志当天时间" dataIndex="logDate" key="logDate" width="10%" render={this.renderColumnLogDate} />
        <Column title="日志上报时间" dataIndex="addTime" key="addTime" width="10%" render={this.renderColumnAddTime} />
        <Column title="操作" dataIndex="action" width="10%" render={this.renderColumnAction} />
      </Table>
    );
  };

  renderWebColumns = (tasks, loading) => {
    return (
      <Table size="middle" dataSource={tasks} loading={loading} pagination={false} scroll={{y: 650}} rowKey="taskId">
        <Column title="设备标识" dataIndex="deviceId" key="deviceId" width="30%" />
        <Column title="日志来源" dataIndex="webSource" key="webSource" width="15%" render={this.renderColumnWebSource} />
        <Column title="环境信息" dataIndex="environment" key="environment" width="15%" render={this.renderColumnEnvironment} />
        <Column title="日志当天时间" dataIndex="logDate" key="logDate" width="10%" render={this.renderColumnLogDate} />
        <Column title="日志上报时间" dataIndex="addTime" key="addTime" width="10%" render={this.renderColumnAddTime} />
        <Column title="操作" dataIndex="action" width="10%" render={this.renderColumnAction} />
      </Table>
    );
  };

  renderColumnPlatform = platform => {
    return ICON_BY_PLATFORM[platform]
  };

  renderColumnWebSource = webSource => {
    if (webSource === null) {
      return <span>-</span>
    } else {
      return <span>{webSource}</span>
    }
  };

  renderColumnEnvironment = environment => {
    if (environment === null) {
      return <span>-</span>
    } else {
      return <span>{environment}</span>
    }
  };

  renderColumnLogDate = logDate => {
    return <div>{moment(logDate).format("YYYY-MM-DD")}</div>
  }

  renderColumnAddTime = addTime => {
    return <div>{moment(addTime).format("YYYY-MM-DD HH:mm:ss.SSS")}</div>;
  };

  renderColumnAction = (text, record, index) => {
    const {type} = this.props;
    if (type === "native") {
      return <Button onClick={this.toDetail(record.taskId)}>日志详情</Button>;
    } else {
      return <Button onClick={this.toDetail(record.tasks)}>日志详情</Button>;
    }
  };

  toDetail = tasks => () => {
    const {detailUrlPrefix} = this.props;
    this.props.history.push(`${detailUrlPrefix}?tasks=${tasks}`);
  };
}

export default ListPage;
