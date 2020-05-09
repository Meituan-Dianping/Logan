import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";

import { LoganTask } from "./logan-task";

@Entity({ database: 'logan', name: 'logan_log_detail', engine: 'InnoDB' })
export class LoganLogDetail extends BaseEntity {
    @PrimaryGeneratedColumn({ type: 'bigint', comment: '主键id' })
    id: number;

    @Column({ type: 'bigint', nullable: false, comment: '所属任务id' })
    task_id: number;

    @Column({ type: 'int', unsigned: true, comment: '日志类型' })
    log_type: number;

    @Column({ type: 'text', collation: 'utf8mb4_unicode_ci', nullable: false, comment: '原始日志' })
    content: string;

    @Column({ type: 'bigint', unsigned: true, nullable: false, comment: '本条日志产生的具体时间戳' })
    log_time: number;

    @UpdateDateColumn({ type: 'timestamp', nullable: false, comment: '添加时间' })
    add_time: string;

    @UpdateDateColumn({ type: 'timestamp', nullable: false, comment: '更新时间' })
    update_time: string;

    @ManyToOne(type => LoganTask)
    @JoinColumn({ name: 'task_id', referencedColumnName: 'id' })
    logan_task: LoganTask;


    // CREATE TABLE `logan_log_detail` (
    //     `id` bigint(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键id',
    //     `task_id` bigint(11) unsigned NOT NULL COMMENT '所属任务id',
    //     `log_type` int(11) unsigned NOT NULL COMMENT '日志类型',
    //     `content` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '原始日志',
    //     `log_time` bigint(20) unsigned NOT NULL COMMENT '本条日志产生的具体时间戳',
    //     `add_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '添加时间',
    //     `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    //     PRIMARY KEY (`id`),
    //     KEY `idx_update_time` (`update_time`),
    //     KEY `idx_task_id` (`task_id`)
    //   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='日志解析后的数据详情';
}