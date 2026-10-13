<!-- ignite-plan
{
  "schema": 2,
  "id": "IGT-1791813346292559552",
  "release": "agent-run-recovery-v1",
  "status": "active",
  "outcome": "AI 可按准确交接并行实施，测试失败可定位、清理和恢复，开发反馈与正式验收分开。",
  "contract_version": 2,
  "execution_contract": 1,
  "task_contract": 2,
  "planning_contract": 1,
  "review_contract": 1,
  "reviews": [
    {
      "stage": "draft",
      "reviewer": "/root/recovery_plan_review",
      "executor": "/root",
      "source": "Codex collaboration sub-agent dispatched by /root as /root/recovery_plan_review",
      "subject_fingerprint": "91e628b962064c00b5fddd6f7063a5e829c6a01c0fb1444b5dd65489fbd0deb2",
      "verdict": "approved",
      "findings": [],
      "identity_assurance": "declared",
      "recorded_at": "2026-10-13T18:45:29.150Z"
    }
  ],
  "verification_contract": 2,
  "goals": [
    {
      "text": "AI 可按准确交接并行实施，测试失败可定位、清理和恢复，开发反馈与正式验收分开。",
      "requirements": [
        "REQ-EXECUTION-042",
        "REQ-EXECUTION-043",
        "REQ-EXECUTION-044",
        "REQ-EXECUTION-045",
        "REQ-EXECUTION-046",
        "REQ-EXECUTION-047",
        "REQ-EXECUTION-048",
        "REQ-EXECUTION-049",
        "REQ-EXECUTION-050",
        "REQ-EXECUTION-051",
        "REQ-EXECUTION-052",
        "REQ-EXECUTION-053"
      ]
    }
  ],
  "constraints": [
    "用户当前要求找到根源并解决，允许必要的缺陷复现和回归；不得把定向测试当作完整 Plan/Release 验收",
    "保留真实红灯、独立审查、Plan/Release 分层验收及权限边界",
    "不修改学生试验的数据、已应用 migration 或历史凭证",
    "开发反馈不冒充正式验收；不自动启动 Agent、推送或部署"
  ],
  "non_goals": [
    "改业务认证或学生业务规则",
    "更换模型或增加外部自动化平台",
    "把尚未验证的冷启动推测当作已确认的认证故障"
  ],
  "authorization": {
    "source": "用户：把问题全部解决，然后开始测试，出问题就改，保证全面通用的高效实用准确。授权本地修复和必要测试；不推送或部署。"
  },
  "deliverables": [
    "受管命令与隔离 E2E",
    "可信红灯和恢复祖先",
    "准确交接及任务前沿",
    "Plan 语义和历史证据兼容",
    "脚本字段门禁与 scoped 回写",
    "完整规格及真实分层验收"
  ],
  "remaining_work": [
    "原生红灯、完整 Plan integration、独立交付审查与 Release 尚未完成，定向回归不替代这些证据。"
  ],
  "change_type": "存量改动",
  "base_commit": "55989efae72221572ae4533eb536741197498b8a",
  "requirements": [
    "REQ-EXECUTION-042",
    "REQ-EXECUTION-043",
    "REQ-EXECUTION-044",
    "REQ-EXECUTION-045",
    "REQ-EXECUTION-046",
    "REQ-EXECUTION-047",
    "REQ-EXECUTION-048",
    "REQ-EXECUTION-049",
    "REQ-EXECUTION-050",
    "REQ-EXECUTION-051",
    "REQ-EXECUTION-052",
    "REQ-EXECUTION-053"
  ],
  "acceptance": [
    {
      "id": "AC-EXECUTION-042",
      "tests": [
        "tests/contracts/execution-proof.test.ts::[AC-EXECUTION-042] cleans up detached descendants after the primary command exits",
        "tests/contracts/managed-command.test.ts::[AC-EXECUTION-042] stops owned descendants and preserves failure diagnostics",
        "tests/contracts/tdd-diagnostics.test.ts::[AC-EXECUTION-042] retains the real runner diagnostic when JSON is missing"
      ],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/execution-proof.test.ts::[AC-EXECUTION-042] cleans up detached descendants after the primary command exits",
          "layer": "unit"
        },
        {
          "test": "tests/contracts/managed-command.test.ts::[AC-EXECUTION-042] stops owned descendants and preserves failure diagnostics",
          "layer": "unit"
        },
        {
          "test": "tests/contracts/tdd-diagnostics.test.ts::[AC-EXECUTION-042] retains the real runner diagnostic when JSON is missing",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-EXECUTION-043",
      "tests": [
        "tests/contracts/execution-proof.test.ts::[AC-EXECUTION-043] gives development-mode Next its own build directory",
        "tests/contracts/e2e-startup.test.ts::[AC-EXECUTION-043] isolates browser startup and warms routes before tests",
        "tests/e2e/auth.spec.ts::[AC-AUTH-001] [AC-AUTH-002] [AC-AUTH-003] [AC-AUTH-005] [AC-PRODUCT-004] [AC-EXECUTION-043] authenticates without the Tasks example"
      ],
      "required_layers": ["unit", "browser"],
      "checks": [
        {
          "test": "tests/contracts/execution-proof.test.ts::[AC-EXECUTION-043] gives development-mode Next its own build directory",
          "layer": "unit"
        },
        {
          "test": "tests/contracts/e2e-startup.test.ts::[AC-EXECUTION-043] isolates browser startup and warms routes before tests",
          "layer": "unit"
        },
        {
          "test": "tests/e2e/auth.spec.ts::[AC-AUTH-001] [AC-AUTH-002] [AC-AUTH-003] [AC-AUTH-005] [AC-PRODUCT-004] [AC-EXECUTION-043] authenticates without the Tasks example",
          "layer": "browser"
        }
      ]
    },
    {
      "id": "AC-EXECUTION-044",
      "tests": [
        "tests/contracts/execution-proof.test.ts::[AC-EXECUTION-044] prepares historical code in an isolated recovery worktree",
        "tests/contracts/tdd-recovery-worktree.test.ts::[AC-EXECUTION-044] prepares recovery without changing the live checkout",
        "tests/contracts/tdd-recovery-worktree.test.ts::[AC-EXECUTION-044] imports a matching receipt while preserving live code and red ancestry",
        "tests/contracts/tdd-recovery-worktree.test.ts::[AC-EXECUTION-044] rejects a receipt when the live acceptance case has changed",
        "tests/contracts/tdd-recovery-worktree.test.ts::[AC-EXECUTION-044] rejects receipts from outside the prepared recovery ancestry",
        "tests/contracts/execution-continuity.test.ts::[AC-EXECUTION-044] preserves an unchanged valid red instead of restarting unrelated work",
        "tests/contracts/tdd-integrity.test.ts::[AC-EXECUTION-044] accepts only the marked target assertion after passing prerequisites",
        "tests/contracts/tdd-integrity.test.ts::[AC-EXECUTION-044] keeps compact matched failures and verifiable digests",
        "tests/contracts/source-analysis.test.ts::[AC-EXECUTION-044] fingerprints applicable hooks and only referenced transitive test helpers"
      ],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/execution-proof.test.ts::[AC-EXECUTION-044] prepares historical code in an isolated recovery worktree",
          "layer": "unit"
        },
        {
          "test": "tests/contracts/tdd-recovery-worktree.test.ts::[AC-EXECUTION-044] prepares recovery without changing the live checkout",
          "layer": "unit"
        },
        {
          "test": "tests/contracts/tdd-recovery-worktree.test.ts::[AC-EXECUTION-044] imports a matching receipt while preserving live code and red ancestry",
          "layer": "unit"
        },
        {
          "test": "tests/contracts/tdd-recovery-worktree.test.ts::[AC-EXECUTION-044] rejects a receipt when the live acceptance case has changed",
          "layer": "unit"
        },
        {
          "test": "tests/contracts/tdd-recovery-worktree.test.ts::[AC-EXECUTION-044] rejects receipts from outside the prepared recovery ancestry",
          "layer": "unit"
        },
        {
          "test": "tests/contracts/execution-continuity.test.ts::[AC-EXECUTION-044] preserves an unchanged valid red instead of restarting unrelated work",
          "layer": "unit"
        },
        {
          "test": "tests/contracts/tdd-integrity.test.ts::[AC-EXECUTION-044] accepts only the marked target assertion after passing prerequisites",
          "layer": "unit"
        },
        {
          "test": "tests/contracts/tdd-integrity.test.ts::[AC-EXECUTION-044] keeps compact matched failures and verifiable digests",
          "layer": "unit"
        },
        {
          "test": "tests/contracts/source-analysis.test.ts::[AC-EXECUTION-044] fingerprints applicable hooks and only referenced transitive test helpers",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-EXECUTION-045",
      "tests": [
        "tests/contracts/execution-proof.test.ts::[AC-EXECUTION-045] returns a task packet with its executable workspace and dependency",
        "tests/contracts/agent-handoff.test.ts::[AC-EXECUTION-045] returns an executable handoff from the current Plan"
      ],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/execution-proof.test.ts::[AC-EXECUTION-045] returns a task packet with its executable workspace and dependency",
          "layer": "unit"
        },
        {
          "test": "tests/contracts/agent-handoff.test.ts::[AC-EXECUTION-045] returns an executable handoff from the current Plan",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-EXECUTION-046",
      "tests": [
        "tests/contracts/execution-proof.test.ts::[AC-EXECUTION-046] appends an execution note without changing the review subject",
        "tests/contracts/plan-notes.test.ts::[AC-EXECUTION-046] appends execution notes without changing draft approval"
      ],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/execution-proof.test.ts::[AC-EXECUTION-046] appends an execution note without changing the review subject",
          "layer": "unit"
        },
        {
          "test": "tests/contracts/plan-notes.test.ts::[AC-EXECUTION-046] appends execution notes without changing draft approval",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-EXECUTION-047",
      "tests": [
        "tests/contracts/execution-proof.test.ts::[AC-EXECUTION-047] selects only mapped feedback cases without writing evidence",
        "tests/contracts/targeted-feedback.test.ts::[AC-EXECUTION-047] selects focused feedback without publishing acceptance"
      ],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/execution-proof.test.ts::[AC-EXECUTION-047] selects only mapped feedback cases without writing evidence",
          "layer": "unit"
        },
        {
          "test": "tests/contracts/targeted-feedback.test.ts::[AC-EXECUTION-047] selects focused feedback without publishing acceptance",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-EXECUTION-048",
      "tests": [
        "tests/contracts/execution-proof.test.ts::[AC-EXECUTION-048] keeps working and committed delivery reviews equal with CRLF input",
        "tests/contracts/execution-continuity.test.ts::[AC-EXECUTION-048] reviews identical working and committed inputs as the same delivery"
      ],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/execution-proof.test.ts::[AC-EXECUTION-048] keeps working and committed delivery reviews equal with CRLF input",
          "layer": "unit"
        },
        {
          "test": "tests/contracts/execution-continuity.test.ts::[AC-EXECUTION-048] reviews identical working and committed inputs as the same delivery",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-EXECUTION-049",
      "tests": [
        "tests/contracts/execution-proof.test.ts::[AC-EXECUTION-049] exposes independent todo work alongside a task already in progress",
        "tests/contracts/execution-continuity.test.ts::[AC-EXECUTION-049] keeps independent work visible while another task is running",
        "tests/contracts/execution-continuity.test.ts::[AC-EXECUTION-049] carries task source and verification ownership in the handoff",
        "tests/contracts/preparation-frontier.test.ts::[AC-EXECUTION-049] reports parallel candidates only when declared scopes, ACs, owners and interfaces support them"
      ],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/execution-proof.test.ts::[AC-EXECUTION-049] exposes independent todo work alongside a task already in progress",
          "layer": "unit"
        },
        {
          "test": "tests/contracts/execution-continuity.test.ts::[AC-EXECUTION-049] keeps independent work visible while another task is running",
          "layer": "unit"
        },
        {
          "test": "tests/contracts/execution-continuity.test.ts::[AC-EXECUTION-049] carries task source and verification ownership in the handoff",
          "layer": "unit"
        },
        {
          "test": "tests/contracts/preparation-frontier.test.ts::[AC-EXECUTION-049] reports parallel candidates only when declared scopes, ACs, owners and interfaces support them",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-EXECUTION-050",
      "tests": [
        "tests/contracts/execution-proof.test.ts::[AC-EXECUTION-050] reports an unfinished upstream Plan as a handoff blocker",
        "tests/contracts/handoff-dependencies.test.ts::[AC-EXECUTION-050] refuses missing upstream prerequisites in a standalone task packet"
      ],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/execution-proof.test.ts::[AC-EXECUTION-050] reports an unfinished upstream Plan as a handoff blocker",
          "layer": "unit"
        },
        {
          "test": "tests/contracts/handoff-dependencies.test.ts::[AC-EXECUTION-050] refuses missing upstream prerequisites in a standalone task packet",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-EXECUTION-051",
      "tests": [
        "tests/contracts/execution-proof.test.ts::[AC-EXECUTION-051] includes the tool-script type check in the policy integration commands",
        "tests/contracts/tool-type-contract.test.ts::[AC-EXECUTION-051] rejects historical wrong Git and registry field reads"
      ],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/execution-proof.test.ts::[AC-EXECUTION-051] includes the tool-script type check in the policy integration commands",
          "layer": "unit"
        },
        {
          "test": "tests/contracts/tool-type-contract.test.ts::[AC-EXECUTION-051] rejects historical wrong Git and registry field reads",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-EXECUTION-052",
      "tests": [
        "tests/contracts/execution-proof.test.ts::[AC-EXECUTION-052] updates a task without scanning an unrelated malformed Release",
        "tests/contracts/scoped-mutation.test.ts::[AC-EXECUTION-052] updates scoped task, note, and review without scanning unrelated releases"
      ],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/execution-proof.test.ts::[AC-EXECUTION-052] updates a task without scanning an unrelated malformed Release",
          "layer": "unit"
        },
        {
          "test": "tests/contracts/scoped-mutation.test.ts::[AC-EXECUTION-052] updates scoped task, note, and review without scanning unrelated releases",
          "layer": "unit"
        }
      ]
    },
    {
      "id": "AC-EXECUTION-053",
      "tests": [
        "tests/contracts/execution-proof.test.ts::[AC-EXECUTION-053] rejects a Feature with missing preparation headings and a broken local link",
        "tests/contracts/preparation-frontier.test.ts::[AC-EXECUTION-053] checks Feature headings and local links for every declared REQ during preparation"
      ],
      "required_layers": ["unit"],
      "checks": [
        {
          "test": "tests/contracts/execution-proof.test.ts::[AC-EXECUTION-053] rejects a Feature with missing preparation headings and a broken local link",
          "layer": "unit"
        },
        {
          "test": "tests/contracts/preparation-frontier.test.ts::[AC-EXECUTION-053] checks Feature headings and local links for every declared REQ during preparation",
          "layer": "unit"
        }
      ]
    }
  ],
  "verification_requirements": ["unit", "browser"],
  "tasks": [
    {
      "id": "PREP",
      "title": "对齐用户目标、12 项验收及独立开工审查",
      "phase": "prepare",
      "acceptance": [],
      "status": "done",
      "result": "原始结果、缺陷、行为断言、写入边界和审查对象一致；不把结构检查当作行为完成。",
      "scope": [
        "docs/features/execution.md",
        "docs/plans/20261012-agent-run-recovery.md",
        "docs/plans/releases/agent-run-recovery-v1.json",
        "tests/contracts/execution-proof.test.ts"
      ],
      "depends_on": [],
      "owner": "/root"
    },
    {
      "id": "R042",
      "title": "取得 AC-EXECUTION-042 的真实目标失败",
      "phase": "red",
      "acceptance": ["AC-EXECUTION-042"],
      "status": "done",
      "result": "同一实际目标测试在真实未实现版本失败，保留原生回执和 Git 祖先。",
      "scope": ["docs/others/evidence/tdd/IGT-1791813346292559552/"],
      "depends_on": ["PREP"],
      "owner": "/root"
    },
    {
      "id": "R043",
      "title": "取得 AC-EXECUTION-043 的真实目标失败",
      "phase": "red",
      "acceptance": ["AC-EXECUTION-043"],
      "status": "done",
      "result": "同一实际目标测试在真实未实现版本失败，保留原生回执和 Git 祖先。",
      "scope": ["docs/others/evidence/tdd/IGT-1791813346292559552/"],
      "depends_on": ["PREP"],
      "owner": "/root"
    },
    {
      "id": "R044",
      "title": "取得 AC-EXECUTION-044 的真实目标失败",
      "phase": "red",
      "acceptance": ["AC-EXECUTION-044"],
      "status": "done",
      "result": "同一实际目标测试在真实未实现版本失败，保留原生回执和 Git 祖先。",
      "scope": ["docs/others/evidence/tdd/IGT-1791813346292559552/"],
      "depends_on": ["PREP"],
      "owner": "/root"
    },
    {
      "id": "R045",
      "title": "取得 AC-EXECUTION-045 的真实目标失败",
      "phase": "red",
      "acceptance": ["AC-EXECUTION-045"],
      "status": "done",
      "result": "同一实际目标测试在真实未实现版本失败，保留原生回执和 Git 祖先。",
      "scope": ["docs/others/evidence/tdd/IGT-1791813346292559552/"],
      "depends_on": ["PREP"],
      "owner": "/root"
    },
    {
      "id": "R046",
      "title": "取得 AC-EXECUTION-046 的真实目标失败",
      "phase": "red",
      "acceptance": ["AC-EXECUTION-046"],
      "status": "done",
      "result": "同一实际目标测试在真实未实现版本失败，保留原生回执和 Git 祖先。",
      "scope": ["docs/others/evidence/tdd/IGT-1791813346292559552/"],
      "depends_on": ["PREP"],
      "owner": "/root"
    },
    {
      "id": "R047",
      "title": "取得 AC-EXECUTION-047 的真实目标失败",
      "phase": "red",
      "acceptance": ["AC-EXECUTION-047"],
      "status": "done",
      "result": "同一实际目标测试在真实未实现版本失败，保留原生回执和 Git 祖先。",
      "scope": ["docs/others/evidence/tdd/IGT-1791813346292559552/"],
      "depends_on": ["PREP"],
      "owner": "/root"
    },
    {
      "id": "R048",
      "title": "取得 AC-EXECUTION-048 的真实目标失败",
      "phase": "red",
      "acceptance": ["AC-EXECUTION-048"],
      "status": "todo",
      "result": "同一实际目标测试在真实未实现版本失败，保留原生回执和 Git 祖先。",
      "scope": ["docs/others/evidence/tdd/IGT-1791813346292559552/"],
      "depends_on": ["PREP"],
      "owner": "/root"
    },
    {
      "id": "R049",
      "title": "取得 AC-EXECUTION-049 的真实目标失败",
      "phase": "red",
      "acceptance": ["AC-EXECUTION-049"],
      "status": "todo",
      "result": "同一实际目标测试在真实未实现版本失败，保留原生回执和 Git 祖先。",
      "scope": ["docs/others/evidence/tdd/IGT-1791813346292559552/"],
      "depends_on": ["PREP"],
      "owner": "/root"
    },
    {
      "id": "R050",
      "title": "取得 AC-EXECUTION-050 的真实目标失败",
      "phase": "red",
      "acceptance": ["AC-EXECUTION-050"],
      "status": "todo",
      "result": "同一实际目标测试在真实未实现版本失败，保留原生回执和 Git 祖先。",
      "scope": ["docs/others/evidence/tdd/IGT-1791813346292559552/"],
      "depends_on": ["PREP"],
      "owner": "/root"
    },
    {
      "id": "R051",
      "title": "取得 AC-EXECUTION-051 的真实目标失败",
      "phase": "red",
      "acceptance": ["AC-EXECUTION-051"],
      "status": "todo",
      "result": "同一实际目标测试在真实未实现版本失败，保留原生回执和 Git 祖先。",
      "scope": ["docs/others/evidence/tdd/IGT-1791813346292559552/"],
      "depends_on": ["PREP"],
      "owner": "/root"
    },
    {
      "id": "R052",
      "title": "取得 AC-EXECUTION-052 的真实目标失败",
      "phase": "red",
      "acceptance": ["AC-EXECUTION-052"],
      "status": "todo",
      "result": "同一实际目标测试在真实未实现版本失败，保留原生回执和 Git 祖先。",
      "scope": ["docs/others/evidence/tdd/IGT-1791813346292559552/"],
      "depends_on": ["PREP"],
      "owner": "/root"
    },
    {
      "id": "R053",
      "title": "取得 AC-EXECUTION-053 的真实目标失败",
      "phase": "red",
      "acceptance": ["AC-EXECUTION-053"],
      "status": "todo",
      "result": "同一实际目标测试在真实未实现版本失败，保留原生回执和 Git 祖先。",
      "scope": ["docs/others/evidence/tdd/IGT-1791813346292559552/"],
      "depends_on": ["PREP"],
      "owner": "/root"
    },
    {
      "id": "IP",
      "title": "受管命令保持诊断并清理自己的进程",
      "phase": "implement",
      "acceptance": ["AC-EXECUTION-042"],
      "status": "todo",
      "result": "目标行为及失败边界符合映射规格，保留同一断言；局部回归通过仍不等于交付完成。",
      "scope": [
        "scripts/ignite/managed-command.mjs",
        "scripts/ignite/check-worker.mjs",
        "scripts/ignite/runs.mjs",
        "tests/contracts/managed-command.test.ts",
        "tests/contracts/tdd-diagnostics.test.ts"
      ],
      "depends_on": ["R042"],
      "owner": "/root"
    },
    {
      "id": "IE",
      "title": "浏览器启动与缓存隔离且生产模式保留真实构建",
      "phase": "implement",
      "acceptance": ["AC-EXECUTION-043"],
      "status": "todo",
      "result": "目标行为及失败边界符合映射规格，保留同一断言；局部回归通过仍不等于交付完成。",
      "scope": [
        "scripts/run-e2e.mjs",
        "scripts/testing/e2e-runtime.mjs",
        "tests/e2e/global-setup.ts",
        "playwright.config.ts",
        "next.config.mjs",
        "tsconfig.json",
        "tests/contracts/e2e-startup.test.ts",
        "tests/e2e/auth.spec.ts"
      ],
      "depends_on": ["R043"],
      "owner": "/root"
    },
    {
      "id": "IT",
      "title": "恢复原生红灯并拒绝准备失败或变化的测试上下文",
      "phase": "implement",
      "acceptance": ["AC-EXECUTION-044"],
      "status": "todo",
      "result": "目标行为及失败边界符合映射规格，保留同一断言；局部回归通过仍不等于交付完成。",
      "scope": [
        "scripts/ignite/tdd.mjs",
        "scripts/ignite/tdd-recovery.mjs",
        "scripts/ignite/source-analysis.mjs",
        "tests/contracts/tdd-integrity.test.ts",
        "tests/contracts/source-analysis.test.ts",
        "tests/contracts/tdd-recovery-worktree.test.ts",
        "tests/contracts/method-recovery.test.ts"
      ],
      "depends_on": ["R044"],
      "owner": "/root"
    },
    {
      "id": "IH",
      "title": "交接准确范围、前置与可并行任务",
      "phase": "implement",
      "acceptance": ["AC-EXECUTION-045", "AC-EXECUTION-049", "AC-EXECUTION-050"],
      "status": "todo",
      "result": "目标行为及失败边界符合映射规格，保留同一断言；局部回归通过仍不等于交付完成。",
      "scope": [
        "scripts/ignite/agent-handoff.mjs",
        "tests/contracts/agent-handoff.test.ts",
        "tests/contracts/handoff-dependencies.test.ts",
        "tests/contracts/execution-focus.test.ts"
      ],
      "depends_on": ["R045", "R049", "R050"],
      "owner": "/root"
    },
    {
      "id": "IF",
      "title": "局部记录和反馈不写正式证明或扫描不相关记录",
      "phase": "implement",
      "acceptance": ["AC-EXECUTION-046", "AC-EXECUTION-047", "AC-EXECUTION-052"],
      "status": "todo",
      "result": "目标行为及失败边界符合映射规格，保留同一断言；局部回归通过仍不等于交付完成。",
      "scope": [
        "tests/contracts/plan-notes.test.ts",
        "tests/contracts/targeted-feedback.test.ts",
        "tests/contracts/scoped-mutation.test.ts"
      ],
      "depends_on": ["R046", "R047", "R052"],
      "owner": "/root"
    },
    {
      "id": "II",
      "title": "Plan 语义与历史文件身份一致，真实变化使证据过期",
      "phase": "implement",
      "acceptance": ["AC-EXECUTION-048"],
      "status": "todo",
      "result": "目标行为及失败边界符合映射规格，保留同一断言；局部回归通过仍不等于交付完成。",
      "scope": [
        "scripts/ignite/core.mjs",
        "scripts/ignite/review-contract.mjs",
        "tests/contracts/review-continuity.test.ts",
        "tests/contracts/execution-hardening.test.ts",
        "tests/contracts/ignite-cli.test.ts"
      ],
      "depends_on": ["R048"],
      "owner": "/root"
    },
    {
      "id": "ID",
      "title": "准备入口实际检查 Feature 并提示可执行拆分",
      "phase": "implement",
      "acceptance": ["AC-EXECUTION-053"],
      "status": "todo",
      "result": "目标行为及失败边界符合映射规格，保留同一断言；局部回归通过仍不等于交付完成。",
      "scope": [
        "scripts/ignite/preparation.mjs",
        "scripts/create-module.mjs",
        "scripts/create-change.mjs",
        "docs/plans/_template.md",
        "tests/contracts/preparation-frontier.test.ts"
      ],
      "depends_on": ["R053"],
      "owner": "/root"
    },
    {
      "id": "IG",
      "title": "新检查策略纳入执行脚本字段门禁",
      "phase": "implement",
      "acceptance": ["AC-EXECUTION-051"],
      "status": "todo",
      "result": "目标行为及失败边界符合映射规格，保留同一断言；局部回归通过仍不等于交付完成。",
      "scope": [
        "scripts/ignite/checks.mjs",
        "scripts/ignite/governance.mjs",
        "scripts/typecheck-tools.mjs",
        "package.json",
        ".github/workflows/ci.yml",
        "tests/contracts/tool-type-contract.test.ts"
      ],
      "depends_on": ["R051"],
      "owner": "/root"
    },
    {
      "id": "IC",
      "title": "协调者集成单一共享入口",
      "phase": "implement",
      "acceptance": [
        "AC-EXECUTION-042",
        "AC-EXECUTION-043",
        "AC-EXECUTION-044",
        "AC-EXECUTION-045",
        "AC-EXECUTION-046",
        "AC-EXECUTION-047",
        "AC-EXECUTION-048",
        "AC-EXECUTION-049",
        "AC-EXECUTION-050",
        "AC-EXECUTION-051",
        "AC-EXECUTION-052",
        "AC-EXECUTION-053"
      ],
      "status": "todo",
      "result": "共享入口使用已确定接口，不扩大执行者的写入与验收权限。",
      "scope": [
        "scripts/ignite/cli.mjs",
        "scripts/ignite/state.mjs",
        "AGENTS.md",
        "tests/contracts/execution-continuity.test.ts",
        "tests/contracts/api-design.test.ts",
        "tests/contracts/ci-build-artifact.test.ts",
        "tests/contracts/execution-trust.test.ts",
        "tests/contracts/acceptance-runtime.test.ts"
      ],
      "depends_on": [
        "IP",
        "IE",
        "IT",
        "IH",
        "IF",
        "II",
        "ID",
        "IG",
        "R042",
        "R043",
        "R044",
        "R045",
        "R046",
        "R047",
        "R048",
        "R049",
        "R050",
        "R051",
        "R052",
        "R053"
      ],
      "owner": "/root"
    },
    {
      "id": "VERIFY",
      "title": "回写 Design、独立交付审查并完成 Plan 与 Release 验收",
      "phase": "verify",
      "acceptance": [
        "AC-EXECUTION-042",
        "AC-EXECUTION-043",
        "AC-EXECUTION-044",
        "AC-EXECUTION-045",
        "AC-EXECUTION-046",
        "AC-EXECUTION-047",
        "AC-EXECUTION-048",
        "AC-EXECUTION-049",
        "AC-EXECUTION-050",
        "AC-EXECUTION-051",
        "AC-EXECUTION-052",
        "AC-EXECUTION-053"
      ],
      "status": "todo",
      "result": "完整 Plan integration、独立交付审查和 Release 生产检查有效；保留实际未通过事项。",
      "scope": ["docs/"],
      "depends_on": ["IC"],
      "owner": "/root"
    }
  ],
  "depends_on": [],
  "dependency_contracts": [],
  "shared_files": [
    {
      "path": "scripts/ignite/state.mjs",
      "owner": "/root",
      "mode": "exclusive"
    },
    {
      "path": "scripts/ignite/cli.mjs",
      "owner": "/root",
      "mode": "exclusive"
    },
    {
      "path": "tests/contracts/execution-proof.test.ts",
      "owner": "/root",
      "mode": "exclusive"
    }
  ],
  "handoff": {
    "interfaces": [
      {
        "owner": "/root",
        "consumer": "/root",
        "contract": "受管执行器按 command,args,cwd,env,timeoutMs 返回 exitCode/signal/timedOut/cancelled/error/stdout/stderr；运行器只清理自身租约的进程。"
      },
      {
        "owner": "/root",
        "consumer": "/root",
        "contract": "state 使用 source-analysis 的目标测试与上下文指纹；新红灯回执保留目标标记和失败摘要，旧证明按原生历史契约解释。"
      },
      {
        "owner": "/root",
        "consumer": "/root",
        "contract": "交接从同一 Plan/Feature/Release 生成；依赖与正式验收由协调者判定，子任务反馈不得发布集成证明。"
      }
    ],
    "migrations": [],
    "tests": [
      "当前用户已授权测试；按各 AC 的原生红灯、定向反馈、Plan integration 与最终 Release 执行。"
    ],
    "remaining": []
  },
  "owner": "/root",
  "risk": "feature",
  "data_contract": {
    "access_scope": "not-applicable",
    "access_rationale": "修改执行工具和方法，不改业务 API、认证或用户数据。",
    "migration_impact": "none",
    "rollback": "回退本轮工具和规则改动，保留既有数据库、历史证据和学生试验。",
    "destructive_authorization": null
  },
  "write_scope": [
    "scripts/ignite/",
    "scripts/run-e2e.mjs",
    "scripts/testing/e2e-runtime.mjs",
    "tests/contracts/managed-command.test.ts",
    "tests/contracts/e2e-startup.test.ts",
    "tests/contracts/tdd-recovery-worktree.test.ts",
    "tests/contracts/agent-handoff.test.ts",
    "tests/contracts/plan-notes.test.ts",
    "tests/contracts/targeted-feedback.test.ts",
    "tests/e2e/global-setup.ts",
    "playwright.config.ts",
    "next.config.mjs",
    "tsconfig.json",
    "AGENTS.md",
    "docs/features/execution.md",
    "docs/designs/execution.md",
    "docs/standards/testing.md",
    "docs/standards/ai-agents.md",
    "docs/standards/adoption.md",
    "docs/plans/README.md",
    "docs/others/evidence/README.md",
    "docs/others/test-cases/execution.md",
    "docs/plans/20261012-agent-run-recovery.md",
    "docs/plans/releases/agent-run-recovery-v1.json",
    "tests/contracts/tdd-diagnostics.test.ts",
    "tests/e2e/auth.spec.ts",
    "scripts/ignite/review-contract.mjs",
    "tests/contracts/execution-continuity.test.ts",
    "docs/others/evidence/tdd/IGT-1791813346292559552/",
    "package.json",
    ".github/workflows/ci.yml",
    "scripts/typecheck-tools.mjs",
    "tests/contracts/handoff-dependencies.test.ts",
    "tests/contracts/tool-type-contract.test.ts",
    "tests/contracts/scoped-mutation.test.ts",
    "tests/contracts/tdd-integrity.test.ts",
    "tests/contracts/source-analysis.test.ts",
    "tests/contracts/review-continuity.test.ts",
    "tests/contracts/preparation-frontier.test.ts",
    "tests/contracts/execution-focus.test.ts",
    "tests/contracts/execution-hardening.test.ts",
    "tests/contracts/ignite-cli.test.ts",
    "tests/contracts/execution-proof.test.ts",
    "scripts/ignite/managed-command.mjs",
    "scripts/ignite/check-worker.mjs",
    "scripts/ignite/runs.mjs",
    "scripts/ignite/tdd.mjs",
    "scripts/ignite/tdd-recovery.mjs",
    "scripts/ignite/source-analysis.mjs",
    "tests/contracts/method-recovery.test.ts",
    "scripts/ignite/agent-handoff.mjs",
    "scripts/ignite/core.mjs",
    "scripts/ignite/preparation.mjs",
    "scripts/create-module.mjs",
    "scripts/create-change.mjs",
    "docs/plans/_template.md",
    "scripts/ignite/checks.mjs",
    "scripts/ignite/governance.mjs",
    "scripts/ignite/cli.mjs",
    "scripts/ignite/state.mjs",
    "tests/contracts/api-design.test.ts",
    "tests/contracts/ci-build-artifact.test.ts",
    "tests/contracts/execution-trust.test.ts",
    "tests/contracts/acceptance-runtime.test.ts",
    "docs/"
  ],
  "tdd_evidence": [
    {
      "acceptance_id": "AC-EXECUTION-042",
      "test": "tests/contracts/execution-proof.test.ts::[AC-EXECUTION-042] cleans up detached descendants after the primary command exits",
      "run_id": "tdd-20261013185812-7634cf"
    },
    {
      "acceptance_id": "AC-EXECUTION-043",
      "test": "tests/contracts/execution-proof.test.ts::[AC-EXECUTION-043] gives development-mode Next its own build directory",
      "run_id": "tdd-20261013185911-73a5fe"
    },
    {
      "acceptance_id": "AC-EXECUTION-044",
      "test": "tests/contracts/execution-proof.test.ts::[AC-EXECUTION-044] prepares historical code in an isolated recovery worktree",
      "run_id": "tdd-20261013190010-d3379a"
    },
    {
      "acceptance_id": "AC-EXECUTION-045",
      "test": "tests/contracts/execution-proof.test.ts::[AC-EXECUTION-045] returns a task packet with its executable workspace and dependency",
      "run_id": "tdd-20261013190049-80c8d7"
    },
    {
      "acceptance_id": "AC-EXECUTION-046",
      "test": "tests/contracts/execution-proof.test.ts::[AC-EXECUTION-046] appends an execution note without changing the review subject",
      "run_id": "tdd-20261013190139-c9a58a"
    },
    {
      "acceptance_id": "AC-EXECUTION-047",
      "test": "tests/contracts/execution-proof.test.ts::[AC-EXECUTION-047] selects only mapped feedback cases without writing evidence",
      "run_id": "tdd-20261013190227-3c103f"
    }
  ],
  "required_evidence": ["check-integration"],
  "evidence": [],
  "blocker": null,
  "open_questions": [],
  "integrated_commit": null,
  "updated_at": "2026-10-13"
}
-->

# Ignite 实施计划：agent-run-recovery

## 状态

任务与完成状态以顶部元数据和文末派生进度为准。本节不维护另一份状态。

## 目标

AI 执行失败时可以定位原因、清理自有进程并接续；并行任务拿到准确上下文，避免反复等待和全量重跑。

## 原始目标与覆盖核对

| 原始来源                                                             | 本轮结果                                                           | REQ / AC             | 处理                     |
| -------------------------------------------------------------------- | ------------------------------------------------------------------ | -------------------- | ------------------------ |
| 用户要求“研究怎么才能更快更省心”，并确认“先把问题全部修复，暂不测试” | 命令日志和清理、浏览器准备、隔离恢复、任务交接、状态记录、定向反馈 | EXECUTION-042 至 047 | 全部纳入，当前已授权验证 |

| 当前用户要求全部修复并测试，同源漏洞不得遗漏 | 可信目标红灯、语义身份、准确依赖、字段门禁、轻量回写、Feature 准入及可并行提示 | EXECUTION-044、048 至 053，并保留 042 至 047 | 全部纳入，不用局部成功冒充闭环 |

本 Plan 当前没有实际跨 Plan 前置；AC-050 的上游依赖由真实 CLI 隔离夹具构造，不虚构本次交付的外部依赖。生产模式的最终真实构建和全局浏览器验收由 Release 运行承担，Plan 保留开发态准备及模式隔离的行为检查。

## 整体判断与推进顺序

真实学生试验已观察到红灯执行器缺少可读诊断、遗留 Next 进程、损坏开发缓存、首个注册跳转未完成、修订测试后反复手动恢复及记录放错章节触发复审。注册与 session API 已返回成功，尚不能把页面跳转超时断言为认证故障。

选用已有 check-worker 的进程组与 IPC 租约机制作为共同基础，避免为红灯另外维护生命周期。正式检查保留原证据准出；开发排查只选相关目标并明确不产验收证明。TDD 修正恢复使用隔离工作树和显式历史实现来源，保留活跃目录、数据和旧凭证。派发上下文、状态记录均从原 Plan 生成或回写，不建第二账本。

建设初期由命令和 E2E 两个执行者分开写入；当前差异已交回 root 集成。计划按可验收结果细分，state、CLI 与共同证明用例只有协调者写入；其他切片可在接口确定后独立实施。红灯任务按 AC 分开，不用一个全范围红灯任务阻塞所有独立结果。

## 非目标

不改认证业务、不重写已应用 migration，不推送或部署，不宣称所有模型已通过真实执行评估。

## 变更类型

存量工具与方法修复。没有业务数据迁移；回退本轮差异即可。原文档工作流 Plan 仍保留其原目标和状态，本 Plan 对应新的执行恢复结果。

## 输入规格

[执行规格](../features/execution.md)、[当前设计](../designs/execution.md)、[测试规则](../standards/testing.md)，以及 TEMP 学生试验的真实 Plan、run-20261012100007-552f06 和失败浏览器 trace。

## 已关闭问题

此前用户要求先实施；当前已明确授权测试，不询问重复授权。不把未定故障原因改写为已确认根因。

## 测试与验收设计

十二项 AC 覆盖原六类执行能力及本轮同源漏洞，逐条映射真实命令行为；目标断言与准备步骤分开，辅助函数和 hook 进入新红灯上下文。用户已授权测试。先用真实缺陷回归验证修复，再完成原生红灯、Plan integration 与 Release；定向检查不冒充完整验收。

活跃目录保留此前按授权先写的实现。只提交规格和测试，隔离目录保留真实旧实现执行原生红灯；随后连接证明的 Git 祖先与当前实现，完成正式分层验收。这个新验证循环不倒填此前未执行的记录，也不回退活跃代码或业务数据。

## 实现任务

顶部 tasks 是唯一任务状态。当前用户已授权实现和测试，原生红灯和任务完成仍须实际证据，不手工把门禁改为通过。

## 验收方式

允许测试后在真实未实现快照取得新循环的红灯，再验证当前实现；不倒填本轮未执行的测试。之后依次完成 Plan integration、独立交付审查和 Release 最终验收。

## 设计回写

当前代码入口回写 execution Design，验证范围以真实运行记录为准。

## 状态记录

2026-10-12：用户要求暂不测试。本轮只实施和读取实际差异，保持全部验证未完成，不生成通过记录。

2026-10-13：共同执行器、E2E 隔离与准备、TDD 工作树恢复/导入、任务交接、状态记录、定向反馈已写入源码。独立只读复核发现恢复导入覆盖和 E2E dev 类型引用清理缺口，已补用例及实现。集成时修正未定义变量、错误返回成功、缓存竞争自我阻塞和未取得所有权仍清理共享文件的问题。共同执行器所有权由子 Agent 交回 root。未运行任何测试、检查或构建，没有通过凭证；任务状态保持待验证。

2026-10-13：读取安装中的 Playwright 1.62 启动源码，确认 webServer 使用独立进程组。共同执行器增加 Linux 随机运行归属链和进程起始时间复核，处理脱离组及父进程先退出的后代；相应断言已覆盖 detached 后代，未执行。原生命令终止信号也回传给调用者。恢复导入在改动活跃历史前核对历史测试和已有绑定，拒绝未经 restart 替换证明。独立只读复核未发现当前进程清理的具体逻辑缺陷，但不代表运行通过。

2026-10-13：用户授权清理 TEMP、复制当前模板、从零开发学生管理系统并测试。暂不测试的上一轮约束在这次 TEMP 试验中解除；主模板仍不能借衍生项目结果标记验收通过。固定单次运行，使用当前可用最低成本 Luna 开发协调者，不进行模型竞技或重复测速。候选只收到普通产品需求，不额外指点技能和并行策略。观察者核对：①项目方法是否有实际产物及可见读取证据，缺少轨迹则标未观察；②实际独立 Agent 是否并行、有无冲突；③注册、学生增改查删、刷新持久化及跨用户隔离是否真实通过；④工程、Plan 和 Release 是否针对同一版本完成且没有虚假宣称；⑤主线程额外纠正、等待和重跑。单次耗时仅描述本轮，不能作为提速因果证明。TEMP 建立独立 Git 历史，不携带建设期 Plan/Release 或旧运行证据，不复制依赖或秘密配置。

2026-10-13：TEMP/campus 的复制基线为 2defc5b08b69d6c1481621864e554c4632ad8698，开发协调者启动于 2026-10-12T18:42:19Z。其自启动阶段实际调用了独立 draft 审查并通过原生准备门禁；但先审不完整草稿、遗漏共享文件/重复 REQ、修改后审查过期、注册邮箱带空格、缺失界面直接 click 导致动作超时，造成持续准备与测试返工。已观察到三项历史红灯及新循环的 API 红灯，无学生功能实现。无效 browser 前提失败曾被原生断言识别器记录，后由协调者发现并撤销绑定，保留历史。执行宿主不向观察者暴露完整技能读取轨迹，不能用自报证明所有方法都已阅读。为避免无穷重复，root 明确纠正不要因未关联的浏览器改动重开有效 API 证明，并明确要求前后端实际并行；从这一干预起的交付归为协调介入后的完成，不作为原始无额外引导运行自动达标。

2026-10-13：协调介入后的学生系统已完成四项 AC 红灯，进入实现。已观察到 `/root/campus_builder/students_api` 与 `/root/campus_builder/students_ui` 同时运行，协调者持有 schema、API 注册和导航的共享写入。数据库重复学号断言的用户范围修正，在 root 提醒前已经提交，不能归因于该提醒。到此只有准备与红灯证明，尚无功能绿灯；主模板状态不变。

2026-10-13：学生功能集成版本 626f6eb 的首次 integration 在治理阶段发现数据库 Design 快照未同步，尚未执行行为验收。另有 Release `_template.json` 缺失，经核对该文件在主模板受跟踪，是 root 准备副本时误将模板与建设期 Release 实例一起排除；副本已恢复，相关返工归于实验准备，不能据此判定主模板缺陷。四项学生行为尚未出现绿灯。

2026-10-13：正式运行 run-20261012203900-b57970 通过 diff、模板诊断、治理和文档检查，因继承的 e2e-startup 测试类型检查失败停止。restoreE2eNextEnv 的 generatedContent 默认 null 且未声明类型，TypeScript 推断拒绝 Buffer。root 在主模板补 Uint8Array/null 参数类型，未放宽行为或断言，副本等待活动反馈结束后应用并验证。root 随后要求用现有定向反馈优先观察业务；三个学生 API 用例通过，但不能作为正式验收。真实浏览器反馈暴露导航定位器同时匹配侧栏与工作台卡片，六个学生流程尚未到目标行为；不能把这个失败解释为学生 API 或数据保存失败。

2026-10-13：独立只读审查 `/root/campus_review` 对未完成学生交付给出 ISSUES。已接受补充真实跨账号 PUT/DELETE 404 与原行不变、真实姓名/大小写搜索、空与超长字段不新增数据的证明；没有据其单元/源码正向检查批准交付。浏览器后续反馈的失败另包括手机端侧栏链接在视口外、连续视口场景保留旧搜索词隐藏新记录；先修夹具后统一验证，不能放宽断言或超时预算。协调者报告使用 AC 级 restart 时会同时清空该 AC 的有效 unit 绑定，当前没有直接复绑入口，重建证据属于原生恢复成本；不能把所有重跑都归为模型主动重复，仍应先稳定测试再集中恢复。完整技能读取轨迹继续不可观察。

2026-10-13：学生稳定修复 5018c48 的反馈通过后，root 接管恢复组织。新的独立开工审查指出姓名/班级长度遗漏，root 将三字段上限与无新增数据合为同一循环，544120c 保存修正；独立 `/root/campus_length_review` PASS，633a436 保存现有目标下的当前批准。四个原生隔离工作树已建立，实际红灯由独占写入的恢复执行者并行处理，活动实现不回滚。WSL 调用两次遇到自动权限审查超时，重试/拆分后继续；未运行进程不证明模型空等，先前对等待原因的判断须限制为观察到无活动命令和无新产物，不能把全部时间归因于模型。接管后不再作为无额外引导的自然完成样本。

## 准出条件

2026-10-13：用户要求找到覆盖面最广的根源并解决，授权本轮必要复现与回归。共同结构问题是跨步骤的上下文、工作粒度和责任不能可靠接续：next 在一任务 doing 时隐藏其它前置满足任务；任务包遗漏对应 Feature/阶段规则并把正式 integration 交给每个执行者；restart 不先验证绑定，错误撤销仍有效的证明；历史审查使用不存在的 Git 返回字段。现已在原入口修复，不新增调度层。四个定向行为断言先复现真实缺陷再通过，相邻 6 文件共 17 项回归、定向 lint 和 typecheck 通过。夹具准备错误已在真实失败前排除，合成记录只测试校验器，不是原生 red。自动权限审核两次超时、各重试一次才启动，不算测试失败。独立 continuity_review 对本轮四项实际差异给出窄范围 PASS，不是 Plan/Release 批准。本轮未重跑整个学生项目，也未把草稿变成 done；原生红灯和全局组合验收仍未完成。反馈层级不直接等于测试执行器，真实数据库测试可使用 Vitest，本轮没有依据只读审查的推测改造反馈路由。

2026-10-13：隔离恢复首次要求全部实现任务回到基线；root 先只还原目标路径造成准备失败，后在 AC001 隔离树完整还原 T3，取得真实缺失接口红灯，再按真实 Git 祖先及原生导入恢复其余三项证明。该返工属于 root 的恢复组织错误，不能据此判定工具门禁错误。学生正式运行 run-20261012220809-a0196e 通过类型、治理与 lint 后因继承格式问题停止；主模板相应源文件已格式化。直接全量反馈另有未注入安全环境的学生 API 导入失败和未回写最新批准的文档失败，属于反馈调用条件；真实缺陷为生成文件识别把 nextjs.org 写成 next.js.org，以及旧接口快照把 ALL 通配中间件当成接口、旧启动日志夹具继承了真实应用 globalSetup。主模板及副本已修正这三处，副本在安全测试环境下定向 18 项全部通过，仍不代替正式 Plan/Release 验收。

全部纳入行为和兼容性真实通过、独立交付审查无阻断、Design 对齐，且 Release 最终验收有效后才能宣称完成。

2026-10-13：学生正式 integration run-20261012222826-241fc0 在 8192d044606a2e0d135396212c674c0ce69fb5d7 完成，46 文件/238 单元与契约测试、8 真实浏览器场景及包含 6 张表的真实迁移检查通过；四项 AC 的所有必需层级齐全。独立 `/root/campus_final_delivery` 复核实际实现、证据及 Design，通过学生交付审查；另纠正 Plan 把 root 的详细委派说明误称用户原话的来源标注，未缩减目标。Release 验证尚在继续。自然无额外提示阶段已于 root 2026-10-12T20:05:25Z 的协调干预结束：并行实现确实发生，但在明确干预之后；功能正确不代表默认执行省心或高效。这一单次试验仍不能证明所有技能自发调用，更不能推断模型或方法论的提速比例。主模板本 Plan 不借此关闭。

2026-10-13：最终闭环测试失败，生产 Release 未启动。原生 done 历史复核中，scripts/ignite/review-contract.mjs:47 对 runGit 返回值读取 result.status，而 core.mjs:112–115 实际返回 exitCode，导致所有历史输入 identity=null；只读差异记录已确认历史文件确实存在，working/historical delivery 指纹不同，行尾归一化也无效。默认集成提交另外仍指向来源标注修正前的运行版本；显式指定较晚审查提交又被“证据须在集成版本或之后运行”拦截，不能通过拼接证据完成。root 曾误传短 SHA，后改完整 SHA；该次额外返工不归于 Agent。学生副本保持未完成/阻塞，保留正式通过的功能证据和失败记录。当前主模板的历史审查返回字段缺陷尚未修复或验证，不声称完整方法链已达标。

<!-- ignite-progress -->

状态：`active`（由元数据生成）

- [x] PREP · 对齐用户目标、12 项验收及独立开工审查 · done
- [x] R042 · 取得 AC-EXECUTION-042 的真实目标失败 · done
- [x] R043 · 取得 AC-EXECUTION-043 的真实目标失败 · done
- [x] R044 · 取得 AC-EXECUTION-044 的真实目标失败 · done
- [x] R045 · 取得 AC-EXECUTION-045 的真实目标失败 · done
- [x] R046 · 取得 AC-EXECUTION-046 的真实目标失败 · done
- [x] R047 · 取得 AC-EXECUTION-047 的真实目标失败 · done
- [ ] R048 · 取得 AC-EXECUTION-048 的真实目标失败 · todo
- [ ] R049 · 取得 AC-EXECUTION-049 的真实目标失败 · todo
- [ ] R050 · 取得 AC-EXECUTION-050 的真实目标失败 · todo
- [ ] R051 · 取得 AC-EXECUTION-051 的真实目标失败 · todo
- [ ] R052 · 取得 AC-EXECUTION-052 的真实目标失败 · todo
- [ ] R053 · 取得 AC-EXECUTION-053 的真实目标失败 · todo
- [ ] IP · 受管命令保持诊断并清理自己的进程 · todo
- [ ] IE · 浏览器启动与缓存隔离且生产模式保留真实构建 · todo
- [ ] IT · 恢复原生红灯并拒绝准备失败或变化的测试上下文 · todo
- [ ] IH · 交接准确范围、前置与可并行任务 · todo
- [ ] IF · 局部记录和反馈不写正式证明或扫描不相关记录 · todo
- [ ] II · Plan 语义与历史文件身份一致，真实变化使证据过期 · todo
- [ ] ID · 准备入口实际检查 Feature 并提示可执行拆分 · todo
- [ ] IG · 新检查策略纳入执行脚本字段门禁 · todo
- [ ] IC · 协调者集成单一共享入口 · todo
- [ ] VERIFY · 回写 Design、独立交付审查并完成 Plan 与 Release 验收 · todo

验收缺口：原生红灯、完整 Plan integration、独立交付审查与 Release 尚未完成，定向回归不替代这些证据。
证据：尚无
<!-- /ignite-progress -->
