import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, OneToMany, JoinColumn } from "typeorm";

import { LoganLogDetail } from "./log-detail";

@Entity({ database: 'logan', name: 'logan_task', engine: 'InnoDB' })
export class LoganTask extends BaseEntity {
    @PrimaryGeneratedColumn({ type: 'bigint', comment: '主键id' })
    id: number;

    @Column({ type: 'tinyint', nullable: false, comment: '平台1android2iOS' })
    platform: number;

    @Column({ type: 'varchar', length: 64, collation: 'utf8mb4_unicode_ci', default: '', comment: '文件大小' })
    amount: string;

    @Column({ type: 'varchar', length: 32, collation: 'utf8mb4_unicode_ci', default: '', comment: 'app标识' })
    app_id: string;

    @Column({ type: 'varchar', length: 256, collation: 'utf8mb4_unicode_ci', default: '', comment: '用户标识' })
    union_id: string;

    @Column({ type: 'varchar', length: 256, collation: 'utf8mb4_unicode_ci', default: '', comment: '设备标识' })
    device_id: string;

    @Column({ type: 'varchar', length: 64, collation: 'utf8mb4_unicode_ci', default: '', comment: 'app版本' })
    app_version: string;

    @Column({ type: 'varchar', length: 256, collation: 'utf8mb4_unicode_ci', default: '', comment: '构建版本' })
    build_version: string;

    @Column({ type: 'varchar', length: 512, default: '', comment: '日志文件所在路径' })
    log_file_name: string;

    @Column({ type: 'bigint', unsigned: true, default: null, comment: '日志所属日期' })
    log_date: number;

    @Column({ type: 'bigint', unsigned: true, nullable: false, comment: '业务字段，日志上报时间' })
    add_time: number;

    @Column({ type: 'tinyint', unsigned: true, nullable: false, default: 0, comment: '0未分析过,1分析过' })
    status: number;

    @UpdateDateColumn({ type: 'timestamp', nullable: false, comment: '更新时间' })
    update_time: string;

    @OneToMany(type => LoganLogDetail, log_detail => log_detail.logan_task)
    @JoinColumn({ name: 'id', referencedColumnName: 'task_id' })
    log_details: Array<LoganLogDetail>;

    
    // CREATE TABLE `logan_task` (
    //     `id` bigint(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键id',
    //     `platform` tinyint(11) unsigned NOT NULL COMMENT '平台1android2iOS',
    //     `amount` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '文件大小',
    //     `app_id` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT 'app标识',
    //     `union_id` varchar(256) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '用户标识',
    //     `device_id` varchar(256) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '设备标识',
    //     `app_version` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT 'app版本',
    //     `build_version` varchar(256) COLLATE utf8mb4_unicode_ci DEFAULT '' COMMENT '构建版本',
    //     `log_file_name` varchar(512) CHARACTER SET utf8mb4 DEFAULT '' COMMENT '日志文件所在路径',
    //     `log_date` bigint(20) unsigned DEFAULT NULL COMMENT '日志所属日期',
    //     `add_time` bigint(20) unsigned NOT NULL COMMENT '业务字段，日志上报时间',
    //     `status` tinyint(11) unsigned NOT NULL DEFAULT '0' COMMENT '0未分析过,1分析过',
    //     `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    //     PRIMARY KEY (`id`),
    //     KEY `idx_update_time` (`update_time`)
    //   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='上报日志任务表';
}