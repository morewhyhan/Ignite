<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-1791622845430819256",
  "release": "fresh-clone-runtime-v1",
  "status": "active",
  "outcome": "新副本独立加载项目依赖，并正确接受真实测试中的条件防护",
  "contract_version": 2,
  "execution_contract": 1,
  "task_contract": 2,
  "verification_contract": 2,
  "goals": [
    {
      "requirements": ["REQ-METHOD-017", "REQ-METHOD-018"],
      "text": "新副本独立加载项目依赖，并正确接受真实测试中的条件防护"
    }
  ],
  "constraints": [
    "只固定单仓库模板自身根目录，不共享父项目依赖",
    "正式行为验收不因静态准备通过而豁免"
  ],
  "non_goals": ["不把父智能体修复过的旧学生副本当成独立通过"],
  "authorization": {
    "source": "用户要求修复独立试跑发现的问题并重建副本验证"
  },
  "deliverables": ["新副本独立加载项目依赖，并正确接受真实测试中的条件防护"],
  "remaining_work": [],
  "change_type": "存量改动",
  "base_commit": "6c015b064b8c0982022c206bb876b3f5aa6e253e",
  "requirements": ["REQ-METHOD-017", "REQ-METHOD-018"],
  "acceptance": [
    {
      "id": "AC-METHOD-017",
      "tests": ["tests/contracts/fresh-clone-runtime.test.ts::[AC-METHOD-017]"],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/fresh-clone-runtime.test.ts::[AC-METHOD-017]",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-METHOD-018",
      "tests": ["tests/contracts/source-analysis.test.ts::[AC-METHOD-018]"],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/source-analysis.test.ts::[AC-METHOD-018]",
          "layer": "unit"
        }
      ]
    }
  ],
  "verification_requirements": ["unit"],
  "tasks": [
    {
      "id": "T1",
      "title": "还原嵌套副本和防护误判",
      "phase": "prepare",
      "status": "done"
    },
    {
      "id": "T2",
      "title": "记录真实框架加载和校验器红灯",
      "phase": "red",
      "acceptance": ["AC-METHOD-017", "AC-METHOD-018"],
      "status": "doing"
    },
    {
      "id": "T3",
      "title": "固定当前项目根与准确识别占位失败",
      "phase": "implement",
      "acceptance": ["AC-METHOD-017", "AC-METHOD-018"],
      "status": "todo"
    },
    {
      "id": "T4",
      "title": "检查模板并更新采用与设计说明",
      "phase": "verify",
      "status": "todo"
    }
  ],
  "depends_on": [],
  "dependency_contracts": [],
  "shared_files": [],
  "handoff": {
    "interfaces": [],
    "migrations": [],
    "tests": [],
    "remaining": []
  },
  "owner": "root",
  "risk": "infrastructure",
  "data_contract": {
    "migration_impact": "none",
    "rollback": "回滚根目录配置与校验器调整",
    "destructive_authorization": null,
    "access_rationale": "测试报告器只处理本地测试结果，不访问业务数据",
    "access_scope": "not-applicable"
  },
  "write_scope": [
    "next.config.mjs",
    "scripts/ignite/source-analysis.mjs",
    "tests/contracts/fresh-clone-runtime.test.ts",
    "tests/contracts/source-analysis.test.ts",
    "AGENTS.md",
    "README.md",
    "docs/"
  ],
  "tdd_evidence": [],
  "required_evidence": ["check-integration"],
  "evidence": [],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": null,
  "updated_at": "2026-10-10"
}
-->

# 新副本运行修复

## 状态

已完成准备审查，待真实红灯及实现。任务状态由原生 CLI 维护。

## 目标

嵌套克隆从第一次启动就使用自身依赖。真实测试的条件防护不被误判为占位失败。AI 遇到宿主拒绝时先使用授权重试，再判断是否阻塞。

## 原始目标与覆盖核对

用户要求根据独立试跑修复问题并重新克隆验证。REQ-METHOD-017 对应当前项目根目录；REQ-METHOD-018 对应准备检查误判。原始学生系统需求不改写，也不提供方法提示。

## 整体判断与推进顺序

Next 日志明确选中父锁文件。父智能体复现模块错误后，移开旧缓存，服务器开始正常工作。准备检查另一次拒绝了 browser 缺失防护。先复现这两种实际行为，再修复模板根目录和静态检查。完成模板验收后重建副本独立试跑。

## 非目标

不共享父项目依赖，不把父智能体排查后的副本当作独立成功，不放松正式验收。

## 变更类型

存量改动。基线和写入范围以元数据为准。

## 输入规格

功能规格为 docs/features/ai-execution-trust.md 的 REQ-METHOD-017 和 REQ-METHOD-018。

## 已关闭问题

单仓库模板可固定配置文件所在目录。条件防护并非必然失败，静态检查只拒绝无条件失败；行为验收仍须真实执行。WSL 权限恢复步骤由采用规范承载，必读入口直接提醒，不增加适配文档。

## 测试与验收设计

AC-METHOD-017 用真实 Next 配置加载器、父子锁文件检查解析根目录。AC-METHOD-018 用真实校验器检查条件 throw、无条件 throw 和 expect.fail。模板 Release 检查真实构建及浏览器，新副本验证 AI 的恢复和开发行为。

## 实现任务

T1 还原问题和边界。T2 为两项 AC 留下红灯。T3 固定项目根并修正占位识别，更新已有环境说明。T4 运行集成和最终验收，回写设计。

## 验收方式

使用原生 Plan check 与 Release verify。静态检查通过不证明学生系统功能完成，独立试跑单独记录实际结果。

## 设计回写

更新 docs/designs/execution.md 和架构设计中的运行边界，采用规范记录宿主恢复接法。

## 状态记录

公开工具输出、原生红灯及通过记录对应具体被测版本。开发期记录提交后从发布快照退役。

## 准出条件

两项 AC 与工程门禁通过，生产构建和全局浏览器验收通过。新副本继续按原始请求独立执行，未闭环不得报告成功。
