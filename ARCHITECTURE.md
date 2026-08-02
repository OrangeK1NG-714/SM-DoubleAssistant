# sm-doubleassistant 架构

## 产品与边界

- 本项目是浙江科技大学数媒专业导师双选的 uni-app 前端，主平台为微信小程序。
- 它只承载 SM 的学生/教师交互，不成为共享工作区 UI，也不拥有服务端权威状态。
- `src/main.ts` + `src/App.vue` 是运行入口；`pages.config.ts`、`manifest.config.ts` 和 Vite/UnoCSS 配置组成构建入口。
- SM 数据与业务权威只在 `sm-doubleassistant-server`；Go 仅消费脱敏聚合。

## 目录职责

- **delivery**：`src/pages/`、`components/`、`layouts/` 负责展示、输入和平台交互。
- **application**：页面流程与 `hooks/`、`store/user.ts` 当前共同编排登录、活动、志愿和录取展示。
- **domain**：三志愿、角色、活动阶段和页面状态规则目前散在大页面；新增纯规则应放入 `src/domain/<feature>/`。
- **adapter**：`src/api/`、`utils/http.ts`、`interceptors/` 封装 Egg API、双 Token、uni 请求/导航与持久化。
- **composition**：`main.ts` 注册 Pinia/拦截器，App/页面/manifest/Vite 配置组合平台能力。
- `static/` 只放资源，生成的微信产物留在原生忽略目录。

## 依赖方向

- 允许方向为 `delivery -> application -> domain`；API、存储和 uni 平台实现作为 adapter 被 application 调用。
- 页面不直接拼鉴权头、刷新 Token 或复制服务端权限判断；`api/` 不承载页面状态和业务决策。
- domain 不导入 Vue、Pinia、uni、HTTP 或页面组件；store 不反向依赖 pages。
- 新页面流程先建立 `src/application/<feature>/` composable，再由 page/component 调用；纯选择规则进入 domain。
- 服务端仍负责身份、时间窗、成员关系、配额、幂等和一致性，客户端校验仅改善体验。

## 禁止事项

- 不得把 SM Egg 的业务迁到共享 Go，也不得读取或展示其他产品数据。
- 不得恢复已停用的碎片志愿写接口，或在前端伪造录取、配额和支付等权威结果。
- 不得把 JWT、微信 Secret、内部统计令牌或服务端地址凭据写入公开包。
- 不得覆盖当前并发的 UI、`manifest.json`、路由改动；体验版上传、正式发布和凭据使用均需 Human 确认。

## 当前迁移热点

2026-07-29 首批已新增 `src/adapters/auth/uni-auth-session.ts`，成为 Token key、过期判断、
刷新凭据和旧单 Token 兼容的唯一底层所有者；Pinia、HTTP、路由守卫、请求拦截器和下载
调用均经该 facade，架构门禁会阻止页面重新直接读写 Token storage。

- `pages/s_choose/index.vue`（约 840 行）混合教师列表、三志愿状态、订阅、提交和 UI，是第一优先级。
- `pages/userMsg/index.vue`（约 632 行）、`pages/index/index.vue`（约 551 行）、`pages/login/login.vue`（约 512 行）均混合流程和展示。
- `pages/t_choose/index.vue`（约 395 行）承载录取流程；`utils/http.ts` 已降到约 279 行，
  仍承载刷新队列与传输策略。
- 迁移顺序：锁定现有 API/构建，再抽三志愿和活动阶段纯规则，再抽页面 use case/composable，最后拆展示组件。
- 登录/Token adapter 已完成，普通请求和简历 `uploadFile` 共用同一刷新/认证边界；
  下一批优先抽三志愿纯规则和页面用例。

## 验证

- 类型与代码门禁：`pnpm type-check`、`pnpm lint`。
- 微信构建：`pnpm build:mp-weixin`，并保留产物清洗脚本。
- 关键流程还需在微信开发者工具预览：登录、三志愿批量提交、教师录取、订单式重试与权限失败。
- 本地构建或预览不等于上传、提审或正式发布。
