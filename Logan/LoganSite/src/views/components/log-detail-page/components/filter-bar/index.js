import React, { Component } from "react";
import { Checkbox, Row, Col, Divider, Button, Input, Radio, Icon, Dropdown } from "antd";
import "antd/dist/antd.css";
import "./style.scss";
import {nativeLogTypeConfigs, webLogTypeConfigs} from "../../../../../consts/logtypes";

const RadioGroup = Radio.Group;



class FilterBar extends Component {
  state = {
    logTypeDropdownVisible: false,
    sortedDropdownVisible: false,
    keywordTemp: ""
  };

  render() {
    const { filterConditions, logTypesInTask, type, sorted } = this.props;
    const LOGTYPES_CONFIG = type === "native" ? nativeLogTypeConfigs : webLogTypeConfigs;
    const LogTypeMultiCheck = (
      <div>
        <Checkbox.Group
          onChange={this.handleLogTypesChanged}
          className="log-type-checkbox"
          value={
            filterConditions.logTypes.length === logTypesInTask.length
              ? ["all", ...filterConditions.logTypes]
              : filterConditions.logTypes
          }
          selectable={"true"}
        >
          <Row>
            <Col>
              <Checkbox value="all">全选</Checkbox>
            </Col>
          </Row>
          <Divider style={{ margin: "8px 0 5px" }} />
          {logTypesInTask.map(logType => {
            const config = LOGTYPES_CONFIG.find(item => item.logType === logType);
            if (config === undefined) {
              return (
                <Row key={logType} className="log-type-checkitem">
                  <Col>
                    <Checkbox value={logType}>
                      <div className="check-item-wrapper">
                        <span style={{ color: "#000000" }}>未知类型</span>
                      </div>
                    </Checkbox>
                  </Col>
                </Row>
              );
            } else {
              return (
                <Row key={config.logType} className="log-type-checkitem">
                  <Col>
                    <Checkbox value={config.logType}>
                      <div className="check-item-wrapper">
                        <span style={{color: config.displayColor}}>{config.logTypeName}</span>
                      </div>
                    </Checkbox>
                  </Col>
                </Row>
              );
            }
          })}
        </Checkbox.Group>
      </div>
    );

    const sortedMultiCheck = (
      <RadioGroup className="reverse-type" onChange={this.handleSortedChange} value={sorted}>
        <Radio value={true} name={"升序"} className="reverse-type-item" key={"true"}>
          升序
          <Icon type="arrow-up" className="reverse-arrow" />
        </Radio>
        <Radio value={false} name={"降序"} className="reverse-type-item" key={"false"}>
          降序
          <Icon type="arrow-down" className="reverse-arrow" />
        </Radio>
      </RadioGroup>
    );

    return (
      <div className="filterbar-container">
        <Dropdown
          overlay={LogTypeMultiCheck}
          trigger={["click"]}
          visible={this.state.logTypeDropdownVisible}
          onVisibleChange={flag => {
            this.setState({ logTypeDropdownVisible: flag });
          }}
        >
          <Button className="filter-log-type">
            <Icon type="check-square" />
            日志类型
          </Button>
        </Dropdown>
        <Dropdown
          overlay={sortedMultiCheck}
          trigger={["click"]}
          visible={this.state.sortedDropdownVisible}
          onVisibleChange={flag => {
            this.setState({ sortedDropdownVisible: flag });
          }}
        >
          <Button className="filter-log-type">
            <Icon type="check-circle" />
            {filterConditions.sorted === false ? "排序方式：降序" : "排序方式：升序"}
          </Button>
        </Dropdown>

        <div className="filter-keyword-search-wrapper">
          <Input
            style={{ flex: 1 }}
            className="filter-keyword-search"
            placeholder="查找日志关键字，回车提交"
            prefix={
              this.state.keywordTemp ? (
                <Icon
                  type="close-circle-o"
                  style={{ color: "rgba(0,0,0,.25)", cursor: "pointer" }}
                  onClick={this.handleKeywordClear}
                />
              ) : (
                <span />
              )
            }
            suffix={
              this.state.keywordTemp ? (
                <Icon
                  type="search"
                  style={{ color: "rgba(0,0,0,.45)", cursor: "pointer" }}
                  onClick={this.handleKeywordSearchConfirm}
                />
              ) : (
                <span />
              )
            }
            value={this.state.keywordTemp}
            onChange={this.handleKeywordTempChange}
            onPressEnter={this.handleKeywordSearchConfirm}
          />
        </div>
      </div>
    );
  }

  handleLogTypesChanged = checkedItems => {
    const { filterConditions, onFilterConditionChanged, logTypesInTask } = this.props;
    const previousLogTypes = filterConditions.logTypes;
    let result = [];
    if (checkedItems.includes("all")) {
      // 之前是全选，现在单取消某项
      if (previousLogTypes.length === logTypesInTask.length) {
        result = checkedItems.filter(value => {
          return value !== "all"; // checkedItems中要过滤掉'all'这个选项
        });
      } else {
        // 之前不是全选
        result = logTypesInTask;
      }
    } else if (previousLogTypes.length === logTypesInTask.length) {
      result = [];
    } else {
      result = checkedItems;
    }

    onFilterConditionChanged({
      ...filterConditions,
      logTypes: result
    });
  };

  handleSortedChange = e => {
    const { onSortedChanged, rollingListManually } = this.props;
    this.setState({ sortedDropdownVisible: false });
    onSortedChanged(e.target.value);
    rollingListManually(0);
  };

  handleKeywordClear = () => {
    const { filterConditions, onFilterConditionChanged } = this.props;
    onFilterConditionChanged({
      ...filterConditions,
      keyword: ""
    });
    this.setState({
      keywordTemp: "",
      searchCursor: null
    });
  };

  handleKeywordTempChange = e => {
    this.setState({
      keywordTemp: e.target.value
    });
  };

  handleKeywordSearchConfirm = () => {
    const { filterConditions, onFilterConditionChanged } = this.props;
    onFilterConditionChanged({
      ...filterConditions,
      keyword: this.state.keywordTemp
    });
  };
}

export default FilterBar;
