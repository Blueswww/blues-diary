<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { useUserStore } from '@/store/user'
import { useTodoStore } from '@/store/todo'
import { getToday } from '@/utils/dayjs'
import EmptyState from '@/components/EmptyState.vue'

const userStore = useUserStore()
const todoStore = useTodoStore()
const newContent = ref('')
const activeDate = ref(getToday())
const expandedId = ref('')

onShow(() => {
  if (!userStore.isLoggedIn) {
    todoStore.clearCache()
    return
  }
  loadTodos()
})

function loadTodos() {
  todoStore.loadTodosByDate(activeDate.value)
}

function requireLogin(): boolean {
  if (!userStore.isLoggedIn) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return false
  }
  return true
}

async function addTodo() {
  if (!requireLogin()) return
  const content = newContent.value.trim()
  if (!content) return
  await todoStore.addTodo(activeDate.value, content)
  newContent.value = ''
}

async function toggle(todoId: string, done: boolean) {
  if (!requireLogin()) return
  await todoStore.toggleDone(todoId, done)
}

async function removeTodo(todoId: string) {
  if (!requireLogin()) return
  await todoStore.removeTodo(todoId)
}

function toggleExpand(todoId: string) {
  expandedId.value = expandedId.value === todoId ? '' : todoId
}

function changeDate(days: number) {
  const d = new Date(activeDate.value)
  d.setDate(d.getDate() + days)
  activeDate.value = d.toISOString().slice(0, 10)
  loadTodos()
}

const progress = () => todoStore.todayProgress()
</script>

<template>
  <view class="page">
    <!-- 日期切换 -->
    <view class="date-nav">
      <text class="nav-btn" @tap="changeDate(-1)">{{ '<' }} 前一天</text>
      <view class="current-date">
        <text class="date">{{ activeDate }}</text>
      </view>
      <text class="nav-btn" @tap="changeDate(1)">后一天 {{ '>' }}</text>
    </view>

    <!-- 今日进度 -->
    <view class="progress-bar card" v-if="activeDate === getToday() && userStore.isLoggedIn">
      <text class="progress-text">今日完成：{{ todoStore.todayProgress().done }}/{{ todoStore.todayProgress().total }}</text>
      <view class="progress-track">
        <view class="progress-fill" :style="{ width: todoStore.todayProgress().percent + '%' }"></view>
      </view>
    </view>

    <!-- 添加待办 -->
    <view class="add-todo">
      <input
        class="input-field"
        v-model="newContent"
        style="color: #1a1a2e;"
        placeholder="添加新的待办事项"
        @confirm="addTodo"
      />
      <view class="btn-small add-btn" @tap="addTodo">添加</view>
    </view>

    <!-- 待办列表 -->
    <view class="todo-list" v-if="todoStore.todos.length && userStore.isLoggedIn">
      <view
        class="todo-item card"
        :class="{ expanded: expandedId === todo._id }"
        v-for="todo in todoStore.todos"
        :key="todo._id"
        @tap="toggleExpand(todo._id)"
      >
        <view class="checkbox" :class="{ checked: todo.isDone }" @tap.stop="toggle(todo._id, !todo.isDone)">
          <text v-if="todo.isDone">✓</text>
        </view>
        <view class="todo-body">
          <text class="todo-content" :class="{ done: todo.isDone }">{{ todo.content }}</text>
          <text class="todo-time" v-if="expandedId === todo._id">{{ todo.createdAt || '' }}</text>
        </view>
        <text class="delete-todo" @tap.stop="removeTodo(todo._id)">✕</text>
      </view>
    </view>

    <EmptyState v-else text="还没有待办事项" />
  </view>
</template>

<style lang="scss">
.page { padding-top: 24rpx; }
.date-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 32rpx 24rpx;
  .nav-btn {
    font-size: 26rpx;
    color: $primary-color;
    padding: 12rpx;
  }
  .current-date .date { font-size: 32rpx; font-weight: 600; }
}
.progress-bar {
  .progress-text { font-size: 26rpx; color: $text-secondary; margin-bottom: 12rpx; display: block; }
  .progress-track {
    height: 12rpx;
    background: $border-color;
    border-radius: 6rpx;
    overflow: hidden;
    .progress-fill {
      height: 100%;
      background: $primary-color;
      border-radius: 6rpx;
      transition: width 0.3s;
    }
  }
}
.add-todo {
  display: flex;
  gap: 16rpx;
  padding: 0 32rpx 24rpx;
  .input-field {
    flex: 1;
    height: 72rpx;
    padding: 0 24rpx;
    font-size: 28rpx;
    color: $text-primary;
    background: $card-bg;
    border: 2rpx solid $border-color;
    border-radius: 16rpx;
  }
  .add-btn { flex-shrink: 0; }
}
.todo-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  transition: background 0.2s;
  &.expanded {
    background: $primary-light;
    .todo-body .todo-content { font-weight: 600; }
  }
  .checkbox {
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    border: 3rpx solid $border-color;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 24rpx;
    color: #fff;
    &.checked {
      background: $success-color;
      border-color: $success-color;
    }
  }
  .todo-body {
    flex: 1;
    min-width: 0;
    .todo-content {
      font-size: 28rpx;
      display: block;
      &.done {
        text-decoration: line-through;
        color: $text-light;
      }
    }
    .todo-time {
      font-size: 22rpx;
      color: $text-light;
      margin-top: 8rpx;
      display: block;
    }
  }
  .delete-todo {
    color: $text-light;
    font-size: 28rpx;
    padding: 8rpx;
  }
}
</style>
