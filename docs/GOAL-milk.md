# 目标树（示例：一杯客人满意的甜牛奶）

> 这是示例，不是本项目的需求。研究见 [GOAL-milk-research.md](./GOAL-milk-research.md)。
> 它只有两样：一张图，一棵文字金字塔；材料和取舍都在研究里。

## 一、金字塔（图）

```mermaid
flowchart LR
  G["目标：客人满意的甜牛奶"]
  D1["奶源领域"]
  G --> D1
  D2["甜味领域"]
  G --> D2
  D3["混合领域"]
  G --> D3
  D4["温度领域"]
  G --> D4
  D5["外观领域"]
  G --> D5
  D6["包装领域"]
  G --> D6
  D7["出杯领域"]
  G --> D7
  R1["REQ-MILK-001 牛奶必须可食用、没有"]
  D1 --> R1
  R2["REQ-MILK-002 牛奶必须在保质期内"]
  D1 --> R2
  R3["REQ-MILK-003 量至少够做一杯"]
  D1 --> R3
  R4["REQ-SWEET-001 甜味来源必须可食用，"]
  D2 --> R4
  R5["REQ-SWEET-002 甜度要合适，客人喝着"]
  D2 --> R5
  R6["REQ-MIX-001 必须混匀，不能有结块"]
  D3 --> R6
  R7["REQ-MIX-002 搅拌时不能洒出来"]
  D3 --> R7
  R8["REQ-TEMP-001 温度要符合客人的选择"]
  D4 --> R8
  R9["REQ-LOOK-001 端上桌时外观正常"]
  D5 --> R9
  R10["REQ-PACK-001 杯子和封口必须干净、"]
  D6 --> R10
  R11["REQ-TIME-001 点单到交付不超过五分"]
  D7 --> R11
  R12["REQ-ACCEPT-001 客人认可才算完成"]
  D7 --> R12
```

## 二、文字金字塔

- **目标**：做出一杯客人满意的甜牛奶
  - **奶源领域**（解决：奶从哪来、够不够、新不新鲜）
    - **REQ-MILK-001 必要条件：牛奶必须可食用、没有变质**
      - AC：Given 一盒鲜奶 When 闻气味、看状态 Then 没有异味、没有絮状物        ← EV-05
        - 用例：按 AC 执行 → 通过
      - AC：Given 一盒鲜奶 When 倒进透明杯 Then 颜色均匀，没有沉淀              ← EV-06
        - 用例：按 AC 执行 → 通过
      - AC：Given 两勺奶粉兑 200 毫升水 When 搅匀 Then 没有结块                ← EV-06
        - 用例：按 AC 执行 → 通过
      - AC：Given 一盒过期鲜奶 When 检查日期、闻气味 Then 判为不可用            ← EV-07
        - 用例：按 AC 执行 → 失败（判为不合格）
      - AC：Given 一盒有酸味的鲜奶 When 检查 Then 判为不可用                    ← EV-07
        - 用例：按 AC 执行 → 失败（判为不合格）
      - AC：Given 奶粉受潮结块 When 冲兑 Then 判为不可用                        ← EV-07
        - 用例：按 AC 执行 → 失败（判为不合格）
    - **REQ-MILK-002 必要条件：牛奶必须在保质期内**
      - AC：Given 一盒鲜奶 When 查看包装日期 Then 在标注日期内                  ← EV-05
        - 用例：按 AC 执行 → 通过
      - AC：Given 一罐奶粉 When 查看开封日期 Then 在一周内                      ← EV-05
        - 用例：按 AC 执行 → 通过
      - AC：Given 一盒过期鲜奶 When 检查日期 Then 不得使用                      ← EV-07
        - 用例：按 AC 执行 → 失败（判为不合格）
      - AC：Given 开封超过一周的奶粉 When 检查 Then 不得使用                    ← EV-07
        - 用例：按 AC 执行 → 失败（判为不合格）
    - **REQ-MILK-003 必要条件：量至少够做一杯**
      - AC：Given 一个量杯 When 倒入鲜奶 Then 至少 200 毫升                     ← EV-05
        - 用例：按 AC 执行 → 通过
      - AC：Given 奶粉 When 冲兑 Then 到 200 毫升刻度                          ← EV-06
        - 用例：按 AC 执行 → 通过
      - AC：Given 余量只剩 100 毫升 When 接单前检查 Then 提前告知，不接单      ← EV-02
        - 用例：按 AC 执行 → 失败（判为不合格）
      - AC：Given 奶粉只剩一勺 When 冲兑 Then 不够一杯，不接单                  ← EV-02
        - 用例：按 AC 执行 → 失败（判为不合格）
  - **甜味领域**（解决：甜不甜、甜得合不合适）
    - **REQ-SWEET-001 必要条件：甜味来源必须可食用，且不破坏能不能喝**
      - AC：Given 一杯牛奶 When 加一勺白糖 Then 仍然能喝                        ← EV-09
        - 用例：按 AC 执行 → 通过
      - AC：Given 一杯牛奶 When 加一勺蜂蜜 Then 仍然能喝                        ← EV-09
        - 用例：按 AC 执行 → 通过
      - AC：Given 一杯牛奶 When 加一勺炼乳 Then 仍然能喝                        ← EV-09
        - 用例：按 AC 执行 → 通过
      - AC：Given 一杯牛奶 When 加代糖 Then 不算本轮的甜味来源，拒绝            ← EV-11
        - 用例：按 AC 执行 → 失败（判为不合格）
      - AC：Given 一杯牛奶 When 加变质的糖浆 Then 判为不可用                    ← EV-11
        - 用例：按 AC 执行 → 失败（判为不合格）
    - **REQ-SWEET-002 必要条件：甜度要合适，客人喝着舒服**
      - AC：Given 200 毫升牛奶 When 加一勺糖 Then 客人说甜度合适                ← EV-10
        - 用例：按 AC 执行 → 通过
      - AC：Given 200 毫升牛奶 When 加两勺糖 Then 客人仍说可以接受              ← EV-10
        - 用例：按 AC 执行 → 通过
      - AC：Given 200 毫升牛奶 When 加三勺糖 Then 客人说太甜                    ← EV-11
        - 用例：按 AC 执行 → 失败（判为不合格）
      - AC：Given 200 毫升牛奶 When 不加糖 Then 客人说寡淡，补加半勺           ← EV-11
        - 用例：按 AC 执行 → 失败（判为不合格）
      - AC：Given 加糖后发苦 When 复判 Then 判为不合格，重做                    ← EV-11
        - 用例：按 AC 执行 → 失败（判为不合格）
  - **混合领域**（解决：匀不匀、洒不洒）
    - **REQ-MIX-001 必要条件：必须混匀，不能有结块或分层**
      - AC：Given 牛奶和糖 When 用打蛋器搅 10 秒 Then 没有结块                  ← EV-12
        - 用例：按 AC 执行 → 通过
      - AC：Given 牛奶和糖 When 用筷子搅 30 秒 Then 没有结块                    ← EV-12
        - 用例：按 AC 执行 → 通过
      - AC：Given 牛奶和糖 When 盖盖摇晃 15 秒 Then 没有结块                    ← EV-12
        - 用例：按 AC 执行 → 通过
      - AC：Given 搅好的奶 When 静置五分钟 Then 不分层                          ← EV-12
        - 用例：按 AC 执行 → 通过
      - AC：Given 搅拌不足 When 检查杯底 Then 有结块                            ← EV-13
        - 用例：按 AC 执行 → 失败（判为不合格）
      - AC：Given 静置后分层 When 检查 Then 判为不合格                          ← EV-13
        - 用例：按 AC 执行 → 失败（判为不合格）
      - AC：Given 连续两次重搅仍结块 When 检查 Then 重做，不再继续搅            ← EV-14
        - 用例：按 AC 执行 → 失败（判为不合格）
    - **REQ-MIX-002 必要条件：搅拌时不能洒出来**
      - AC：Given 倒到八分满 When 搅拌 Then 不溢出                              ← EV-12
        - 用例：按 AC 执行 → 通过
      - AC：Given 倒到七分满 When 摇晃 Then 不溢出                              ← EV-12
        - 用例：按 AC 执行 → 通过
      - AC：Given 倒到满杯 When 搅拌 Then 溢出，判为不合格，倒掉重来            ← EV-13
        - 用例：按 AC 执行 → 失败（判为不合格）
      - AC：Given 杯盖没盖紧 When 摇晃 Then 渗出，换杯                          ← EV-13
        - 用例：按 AC 执行 → 失败（判为不合格）
  - **温度领域**（解决：凉的热的）
    - **REQ-TEMP-001 必要条件：温度要符合客人的选择**
      - AC：Given 两块冰 When 测温度 Then 是凉的                                ← EV-15
        - 用例：按 AC 执行 → 通过
      - AC：Given 室温放置 When 测温度 Then 不凉                                ← EV-15
        - 用例：按 AC 执行 → 通过
      - AC：Given 加热到 50 度 When 测温度 Then 是温的                          ← EV-15
        - 用例：按 AC 执行 → 通过
      - AC：Given 客人要冰的 When 测温度 Then 是常温，补冰                      ← EV-16
        - 用例：按 AC 执行 → 失败（判为不合格）
      - AC：Given 补冰后 When 复测 Then 仍不达标，重做                          ← EV-17
        - 用例：按 AC 执行 → 失败（判为不合格）
  - **外观领域**（解决：端上桌好不好看）
    - **REQ-LOOK-001 必要条件：端上桌时外观正常**
      - AC：Given 做好的牛奶 When 看表面 Then 没有结块                          ← EV-18
        - 用例：按 AC 执行 → 通过
      - AC：Given 做好五分钟 When 再看 Then 不分层                              ← EV-18
        - 用例：按 AC 执行 → 通过
      - AC：Given 表面有泡沫堆积 When 看表面 Then 撇掉再交付                    ← EV-19
        - 用例：按 AC 执行 → 失败（判为不合格）
      - AC：Given 静置后分层 When 看表面 Then 重搅                              ← EV-19
        - 用例：按 AC 执行 → 失败（判为不合格）
  - **包装领域**（解决：杯子干不干净、封没封好）
    - **REQ-PACK-001 必要条件：杯子和封口必须干净、平整**
      - AC：Given 一只空杯 When 检查杯身和杯口 Then 没有污渍、没有缺口          ← EV-18
        - 用例：按 AC 执行 → 通过
      - AC：Given 装好的一杯 When 检查封口 Then 封膜平整、不歪、不渗            ← EV-18
        - 用例：按 AC 执行 → 通过
      - AC：Given 杯身有污渍 When 检查 Then 换杯                                ← EV-19
        - 用例：按 AC 执行 → 失败（判为不合格）
      - AC：Given 封口歪斜 When 检查 Then 重新封                                 ← EV-19
        - 用例：按 AC 执行 → 失败（判为不合格）
      - AC：Given 封口渗漏 When 倒置检查 Then 换杯重封                          ← EV-19
        - 用例：按 AC 执行 → 失败（判为不合格）
  - **出杯领域**（解决：等多久、先来后到、客认不认可）
    - **REQ-TIME-001 必要条件：点单到交付不超过五分钟**
      - AC：Given 一位客人点单 When 计时到交付 Then 不超过 5 分钟                ← EV-21
        - 用例：按 AC 执行 → 通过
      - AC：Given 三位客人排队 When 按顺序交付 Then 先到先得                    ← EV-21
        - 用例：按 AC 执行 → 通过
      - AC：Given 拖到六分钟 When 交付 Then 记录超时并向客人说明                ← EV-22
        - 用例：按 AC 执行 → 失败（判为不合格）
      - AC：Given 售罄 When 客人点单 Then 拒单并告知                            ← EV-02
        - 用例：按 AC 执行 → 失败（判为不合格）
      - AC：Given 客人中途取消 When 订单取消 Then 不再制作                      ← EV-04
        - 用例：按 AC 执行 → 失败（判为不合格）
    - **REQ-ACCEPT-001 必要条件：客人认可才算完成**
      - AC：Given 客人尝过 When 说满意 Then 这单完成                            ← EV-23
        - 用例：按 AC 执行 → 通过
      - AC：Given 客人尝过 When 说太甜 Then 重做后再确认                        ← EV-24
        - 用例：按 AC 执行 → 失败（判为不合格）
      - AC：Given 重做一次后 When 客人仍不满意 Then 再重做一次                  ← EV-24
        - 用例：按 AC 执行 → 失败（判为不合格）
      - AC：Given 同一单重做两次 When 客人仍不满意 Then 终止并说明              ← EV-24
        - 用例：按 AC 执行 → 失败（判为不合格）
  - **充分路径**：每条 REQ 取一条 AC，得到一条完整路径
    - 路径 A：鲜牛奶 + 白糖 + 筷子 + 常温 + 干净杯，五分钟内交付
    - 路径 B：奶粉冲兑 + 蜂蜜 + 打蛋器 + 冰 + 封口平整，五分钟内交付
    - 路径 C：鲜牛奶 + 炼乳 + 摇晃 + 加热 + 干净杯，五分钟内交付
  - **验收**：客人尝过，说甜度合适、温度对、没有结块、包装没问题、没等太久
