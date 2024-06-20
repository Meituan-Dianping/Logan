import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, OneToMany, JoinColumn } from "typeorm";

import { WebDetail } from "./web-detail";

@Entity({ database: 'logan', name: 'web_task', engine: 'InnoDB' })
export class WebTask extends BaseEntity {
    @PrimaryGeneratedColumn({ type: 'bigint', comment: '主键id' })
    id: number;

    @Column({ type: 'varchar', length: 128, nullable: false, default: '', comment: '设备id' })
    device_id: string;

    @Column({ type: 'varchar', length: 128, default: null, comment: '来源' })
    web_source: string;

    @Column({ type: 'varchar', length: 2048, default: null, comment: '客户端自定义环境信息' })
    environment: string;

    @Column({ type: 'int', nullable: false, comment: '日志页码' })
    page_num: number;

    @Column({ type: 'mediumtext', nullable: false, comment: '日志内容' })
    content: string;

    @Column({ type: 'bigint', nullable: false, comment: '添加时间' })
    add_time: number;

    @Column({ type: 'bigint', nullable: false, comment: '日志所属日期' })
    log_date: number;

    @Column({ type: 'tinyint', unsigned: true, nullable: false, default: 0, comment: '日志状态0未解析，1已解析' })
    status: number;

    @Column({ type: 'varchar', length: 2048, default: null, comment: '自定义上报信息' })
    custom_report_info: string;

    @UpdateDateColumn({ type: 'timestamp', nullable: false, comment: '更新时间' })
    update_time: string;

    @OneToMany(type => WebDetail, web_detail => web_detail.web_task)
    @JoinColumn({ name: 'id', referencedColumnName: 'task_id' })
    web_details: Array<WebDetail>;


    // CREATE TABLE `web_task` (
    //     `id` bigint(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '自增主键',
    //     `device_id` varchar(128) NOT NULL DEFAULT '' COMMENT '设备id',
    //     `web_source` varchar(128) DEFAULT NULL COMMENT '来源',
    //     `environment` varchar(2048) DEFAULT NULL COMMENT '客户端自定义环境信息',
    //     `page_num` int(11) NOT NULL COMMENT '日志页码',
    //     `content` mediumtext NOT NULL COMMENT '日志内容',
    //     `add_time` bigint(20) NOT NULL COMMENT '添加时间',
    //     `log_date` bigint(20) NOT NULL COMMENT '日志所属日期',
    //     `status` int(11) NOT NULL COMMENT '日志状态0未解析，1已解析',
    //     `custom_report_info` varchar(2048) DEFAULT NULL COMMENT '自定义上报信息',
    //     `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    //     PRIMARY KEY (`id`),
    //     KEY `log_date_deviceid` (`log_date`,`device_id`),
    //     KEY `add_time_deviceid` (`add_time`,`device_id`),
    //     KEY `idx_update_time` (`update_time`)
    //   ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='H5上报任务表';
}