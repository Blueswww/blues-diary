<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { useTodoStore } from '@/store/todo'
import { getToday } from '@/utils/dayjs'
import EmptyState from '@/components/EmptyState.vue'

const todoStore = useTodoStore()
const newContent = ref('')
const activeDate = ref(getToday())

onShow(() => {
  loadTodos()
})

function loadTodos() {
  todoStore.loadTodosByDate(activeDate.value)
}

async function addTodo() {
  const content = newContent.value.trim()
  if (!content) return
  await todoStore.addTodo(activeDate.value, content)
  newContent.value = ''
}

async function toggle(todoId: string, done: boolean) {
  await todoStore.toggleDone(todoId, done)
}

async function removeTodo(todoId: string) {
  await todoStore.removeTodo(todoId)
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
      <text class="nav-btn" @tap="changeDate(-1)">&lt; 前一天</text>
      <view class="current-date">
        <text class="date">{{ activeDate }}</text>
      </view>
      <text class="nav-btn" @tap="changeDate(1)">后一天 &gt;</text>
    </view>

    <!-- 今日进度 -->
    <view class="progress-bar card" v-if="activeDate === getToday()">
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
        placeholder="添加新的待办事项"
        @confirm="addTodo"
        confirm-type="done"
      />
      <view class="btn-small add-btn" @tap="addTodo">添加</view>
    </view>

    <!-- 待办列表 -->
    <view class="todo-list" v-if="todoStore.todos.length">
      <view
        class="todo-item card"
        v-for="todo in todoStore.todos"
        :key="todo._id"
        @tap="toggle(todo._id, !todo.isDone)"
      >
        <view class="checkbox" :class="{ checked: todo.isDone }">
          <text v-if="todo.isDone">✓</text>
        </view>
        <text class="todo-content" :class="{ done: todo.isDone }">{{ todo.content }}</text>
        <text class="delete-todo" @tap.stop="removeTodo(todo._id)">✕</text>
      </view>
    </view>

    <EmptyState v-else text="还没有待办事项" />
  </view>
</template>

<style lang="scss" scoped>
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
  .input-field { flex: 1; }
  .add-btn { flex-shrink: 0; }
}
.todo-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
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
  .todo-content {
    flex: 1;
    font-size: 28rpx;
    &.done {
      text-decoration: line-through;
      color: $text-light;
    }
  }
  .delete-todo {
    color: $text-light;
    font-size: 28rpx;
    padding: 8rpx;
  }
}
</style>
