/**
 * 云数据库初始化脚本
 * 在微信开发者工具 -> 云开发控制台 -> 数据库 中手动创建以下集合，
 * 或通过 cloudbase cli 执行此脚本
 *
 * 手动创建方式：
 * 1. 打开微信开发者工具
 * 2. 点击左上角 "云开发" 按钮
 * 3. 进入 "数据库" 标签
 * 4. 分别创建以下集合
 */

const COLLECTIONS = [
  {
    name: 'users',
    description: '用户表',
    indexes: [
      { name: 'openid', unique: true, fields: [{ name: 'openid', direction: 'asc' }] },
    ],
  },
  {
    name: 'diaries',
    description: '日记表',
    indexes: [
      { name: 'userId_date', unique: false, fields: [
        { name: 'userId', direction: 'asc' },
        { name: 'date', direction: 'desc' },
      ]},
      { name: 'tags_index', unique: false, fields: [
        { name: 'tags', direction: 'asc' },
      ]},
    ],
  },
  {
    name: 'tags',
    description: '标签表',
    indexes: [
      { name: 'userId_name', unique: false, fields: [
        { name: 'userId', direction: 'asc' },
        { name: 'name', direction: 'asc' },
      ]},
    ],
  },
  {
    name: 'todos',
    description: '待办事项表',
    indexes: [
      { name: 'userId_date', unique: false, fields: [
        { name: 'userId', direction: 'asc' },
        { name: 'date', direction: 'asc' },
      ]},
    ],
  },
  {
    name: 'anniversaries',
    description: '纪念日表',
    indexes: [
      { name: 'userId_date', unique: false, fields: [
        { name: 'userId', direction: 'asc' },
        { name: 'date', direction: 'asc' },
      ]},
    ],
  },
]

console.log('请在云开发控制台手动创建以下集合：\n')
COLLECTIONS.forEach(c => {
  console.log(`📁 ${c.name} — ${c.description}`)
  console.log(`   索引: ${JSON.stringify(c.indexes.map(i => i.name))}\n`)
})

console.log('快速创建步骤:')
console.log('1. 微信开发者工具 → 云开发 → 数据库')
console.log('2. 点击 "新建集合"，依次创建以上 5 个集合')
console.log('3. 创建后在每个集合的 "索引" 标签页添加对应的索引')
