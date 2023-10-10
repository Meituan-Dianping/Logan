import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";

import { WebTask } from "./web-task";

@Entity({ database: 'logan', name: 'web_detail', engine: 'InnoDB' })
export class WebDetail extends BaseEntity {
    @PrimaryGeneratedColumn({ type: 'bigint', comment: '自增主键' })
    id: number;

    @Column({ type: 'bigint', nullable: false, comment: '所属任务id' })
    task_id: number;

    @Column({ type: 'int', nullable: false, comment: '日志类型' })
    log_type: number;

    @Column({ type: 'mediumtext', nullable: false, comment: '日志内容' })
    content: string;

    @Column({ type: 'bigint', nullable: false, comment: '日志所属时间' })
    log_time: number;

    @Column({ type: 'int', default: null, comment: '日志等级' })
    log_level: number;

    @Column({ type: 'bigint', nullable: false, comment: '添加时间' })
    add_time: number;

    @Column({ type: 'int', nullable: false, comment: '距离当天0点的分钟数' })
    minute_offset: number;

    @ManyToOne(type => WebTask)
    @JoinColumn({ name: 'task_id', referencedColumnName: 'id' })
    web_task: WebTask;


    // CREATE TABLE `web_detail` (
    //     `id` bigint(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '自增主键',
    //     `task_id` bigint(20) NOT NULL COMMENT '所属任务id',
    //     `log_type` int(11) NOT NULL COMMENT '日志类型',
    //     `content` mediumtext NOT NULL COMMENT '日志内容',
    //     `log_time` bigint(20) NOT NULL COMMENT '日志所属时间',
    //     `log_level` int(11) DEFAULT NULL COMMENT '日志等级',
    //     `add_time` bigint(20) NOT NULL COMMENT '添加时间',
    //     `minute_offset` int(11) NOT NULL COMMENT '距离当天0点的分钟数',
    //     PRIMARY KEY (`id`),
    //     KEY `taskid_logtype` (`task_id`,`log_type`)
    //   ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='H5日志详情表';
}