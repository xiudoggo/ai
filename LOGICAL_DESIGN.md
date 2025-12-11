# AI助手前端项目逻辑设计文档

## 1. 概述

AI助手前端项目是一个基于React和Next.js构建的单页应用程序(SPA)，旨在为用户提供与AI模型交互的界面。该应用程序允许用户创建不同的"面具"(角色模板)，并基于这些面具开启会话进行对话。

## 2. 系统架构

### 2.1 整体架构

项目采用分层架构模式，主要包括以下几个层次：

1. **表示层(View Layer)**：由React组件构成，负责用户界面展示和用户交互
2. **状态管理层(State Management Layer)**：使用Zustand管理应用状态，包括会话、面具和聊天消息
3. **数据访问层(Data Access Layer)**：通过HTTP API与后端服务进行数据交换
4. **路由层(Routing Layer)**：使用react-router-dom管理客户端路由

### 2.2 核心模块

#### 2.2.1 状态管理模块

项目使用Zustand作为状态管理解决方案，分为三个核心store：

1. **Session Store**：管理系统中的会话数据
2. **Mask Store**：管理角色模板(面具)数据
3. **Chat Store**：管理聊天消息和AI交互

#### 2.2.2 组件模块

1. **主容器组件(Home)**：应用的主容器，整合侧边栏和路由系统
2. **侧边栏组件(Sidebar)**：包含应用标题和会话列表入口
3. **会话列表组件(ChatList)**：显示所有会话历史并提供管理功能
4. **面具管理组件(Masks)**：提供面具选择、创建和编辑功能
5. **聊天组件(Chat)**：实现实际的聊天界面和消息交互

## 3. 核心业务逻辑

### 3.1 会话管理逻辑

#### 3.1.1 会话创建流程

1. 用户在面具页面选择一个面具或创建新面具
2. 点击面具后触发[handleMaskSelect](file:///E:/项目实战/智能助手前端/ai_assistant/src/app/components/Masks_page.tsx#L68-L75)函数
3. 调用Session Store的[addSession](file:///E:/项目实战/智能助手前端/ai_assistant/src/app/stores/Session.ts#L101-L142)方法创建新会话
4. 会话数据通过HTTP POST请求保存到后端
5. 成功后跳转到聊天页面

#### 3.1.2 会话切换流程

1. 用户在侧边栏点击某个会话
2. 触发ChatList组件中的[handleSessionClick](file:///E:/项目实战/智能助手前端/ai_assistant/src/app/components/ChatList.tsx#L72-L78)函数
3. 调用Session Store的[setCurrentSession](file:///E:/项目实战/智能助手前端/ai_assistant/src/app/stores/Session.ts#L175-L178)方法设置当前会话
4. 调用[loadMessages](file:///E:/项目实战/智能助手前端/ai_assistant/src/app/stores/Session.ts#L225-L251)加载该会话的消息
5. 使用react-router-dom导航到聊天页面

#### 3.1.3 会话删除流程

1. 用户在会话列表中点击删除按钮
2. 触发ChatList组件中的[handleDelete](file:///E:/项目实战/智能助手前端/ai_assistant/src/app/components/ChatList.tsx#L15-L21)函数
3. 调用Session Store的[removeSession](file:///E:/项目实战/智能助手前端/ai_assistant/src/app/stores/Session.ts#L143-L164)方法
4. 通过HTTP请求从后端删除会话数据
5. 从前端状态中移除该会话

### 3.2 面具管理逻辑

#### 3.2.1 面具加载流程

1. Masks组件挂载时调用useEffect钩子
2. 触发Mask Store的[getMasks](file:///E:/项目实战/智能助手前端/ai_assistant/src/app/stores/Mask.ts#L32-L51)方法
3. 通过HTTP GET请求从后端获取所有面具数据
4. 将获取的数据存储在LocalMasks状态中

#### 3.2.2 面具创建流程

1. 用户点击"创建新面具"按钮
2. 显示面具创建表单
3. 用户填写表单并提交
4. 调用Mask Store的[addMask](file:///E:/项目实战/智能助手前端/ai_assistant/src/app/stores/Mask.ts#L52-L78)方法
5. 通过HTTP POST请求将新面具保存到后端
6. 更新前端LocalMasks状态

#### 3.2.3 面具编辑流程

1. 用户点击面具的编辑按钮
2. 显示面具编辑表单并填充当前数据
3. 用户修改数据并保存
4. 调用Mask Store的[updateMask](file:///E:/项目实战/智能助手前端/ai_assistant/src/app/stores/Mask.ts#L95-L127)方法
5. 通过HTTP POST请求更新后端面具数据
6. 更新前端LocalMasks状态

#### 3.2.4 面具删除流程

1. 用户点击面具的删除按钮
2. 调用Mask Store的[removeMask](file:///E:/项目实战/智能助手前端/ai_assistant/src/app/stores/Mask.ts#L79-L94)方法
3. 通过HTTP POST请求从后端删除面具数据
4. 从前端LocalMasks状态中移除该面具

### 3.3 聊天交互逻辑

#### 3.3.1 消息发送流程

1. 用户在聊天界面输入消息并发送
2. 触发Chat组件中的[handleSendMessage](file:///E:/项目实战/智能助手前端/ai_assistant/src/app/components/Chat.tsx#L56-L75)函数
3. 创建新的用户消息对象
4. 调用Session Store的[addMessage](file:///E:/项目实战/智能助手前端/ai_assistant/src/app/stores/Session.ts#L179-L224)方法
5. 通过HTTP请求将消息保存到后端会话中
6. 调用Chat Store的[submitMessage](file:///E:/项目实战/智能助手前端/ai_assistant/src/app/stores/ChatMessage.ts#L35-L94)方法向AI发送请求

#### 3.3.2 AI响应处理流程

1. Chat Store的submitMessage方法向AI服务发送请求
2. 接收AI的响应数据
3. 创建新的AI消息对象
4. 调用Session Store的addMessage方法保存AI消息
5. 更新前端状态以显示新消息

## 4. 数据模型设计

### 4.1 核心数据实体

#### 4.1.1 面具(Mask)

```typescript
type Mask = {
    id: string;      // 唯一标识符
    name: string;    // 面具名称
    description: string; // 面具描述(用于AI系统提示)
}
```

#### 4.1.2 会话(Session)

```typescript
type Session = {
    id: string;           // 唯一标识符
    createTime: string;   // 创建时间
    lastUpdate: string;   // 最后更新时间
    topic: string;        // 会话主题(通常来自面具名称)
    messages: ChatMessage[]; // 消息列表
    mask?: Mask;          // 关联的面具
}
```

#### 4.1.3 消息(ChatMessage)

```typescript
type ChatMessage = {
    role: string;     // 消息角色(user/assistant)
    content: string;  // 消息内容
    id: string;       // 唯一标识符
    date: string;     // 消息时间
    sessionId: string; // 所属会话ID
}
```

## 5. 状态管理设计

### 5.1 Session Store状态

Session Store管理以下状态：
- LocalSessions: 本地会话列表
- currentSessionId: 当前会话ID
- LocalMessages: 当前会话的消息列表
- sortedSessions: 已排序会话ID列表

### 5.2 Mask Store状态

Mask Store管理以下状态：
- LocalMasks: 本地面具列表

### 5.3 Chat Store状态

Chat Store管理以下状态：
- AI_returned_message: AI返回的最新消息

## 6. 路由设计

### 6.1 路由映射

1. `/` - 面具选择页面(Masks组件)
2. `/chat` - 聊天页面(Chat组件)

### 6.2 路由导航逻辑

- 从面具页面选择面具后导航到聊天页面
- 从聊天页面点击返回按钮导航到面具页面
- 在侧边栏点击会话时导航到聊天页面

## 7. 用户交互流程

### 7.1 标准聊天流程

1. 用户打开应用，进入面具选择页面
2. 用户选择一个面具或创建新面具
3. 系统创建新会话并跳转到聊天页面
4. 用户输入消息并发送
5. 系统保存用户消息并向AI发送请求
6. 系统接收AI响应并显示给用户
7. 循环步骤4-6直到会话结束

### 7.2 会话管理流程

1. 用户在侧边栏查看会话列表
2. 用户可以创建新会话(通过面具页面)
3. 用户可以切换到已有会话
4. 用户可以编辑会话名称
5. 用户可以删除不需要的会话

### 7.3 面具管理流程

1. 用户在面具页面查看可用面具
2. 用户可以选择现有面具创建会话
3. 用户可以创建新面具
4. 用户可以编辑现有面具
5. 用户可以删除不需要的面具

## 8. 异常处理设计

### 8.1 网络异常处理

1. API请求失败时显示错误信息
2. 提供重试机制
3. 在网络恢复后自动同步数据

### 8.2 数据异常处理

1. 数据格式验证
2. 缺失数据的默认值处理
3. 数据一致性检查

### 8.3 用户操作异常处理

1. 防止重复提交
2. 输入验证和限制
3. 操作确认机制

## 9. 性能优化考虑

### 9.1 数据加载优化

1. 按需加载会话消息
2. 消息列表排序优化
3. 缓存机制避免重复请求

### 9.2 UI渲染优化

1. 虚拟滚动处理长消息列表
2. 组件懒加载
3. 状态更新最小化