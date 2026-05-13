/**
 * 部署辅助脚本
 *
 * 使用方式:
 *   node deploy.js                    # 构建 H5 + 云函数
 *   node deploy.js cloud             # 仅部署云函数
 *   node deploy.js h5                # 仅构建 H5
 *
 * 前提: 已安装 @cloudbase/cli (npm i -g @cloudbase/cli)
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const CLOUD_FUNCTIONS_DIR = path.join(__dirname, 'cloudfunctions')

function run(cmd) {
  console.log(`> ${cmd}`)
  execSync(cmd, { stdio: 'inherit', cwd: __dirname })
}

async function deployCloudFunctions() {
  console.log('\n📦 部署云函数...\n')

  // 为每个云函数安装依赖
  const functions = fs.readdirSync(CLOUD_FUNCTIONS_DIR)
    .filter(f => f !== 'common' && fs.statSync(path.join(CLOUD_FUNCTIONS_DIR, f)).isDirectory())

  for (const fn of functions) {
    const fnPath = path.join(CLOUD_FUNCTIONS_DIR, fn)
    const pkgPath = path.join(fnPath, 'package.json')

    if (fs.existsSync(pkgPath)) {
      console.log(`  安装 ${fn} 依赖...`)
      execSync('npm install', { stdio: 'inherit', cwd: fnPath })
    }
  }

  // 使用 cloudbase cli 部署
  try {
    run('npx @cloudbase/cli functions:deploy')
    console.log('\n✅ 云函数部署完成')
  } catch (e) {
    console.error('\n❌ 云函数部署失败，请确认已安装 @cloudbase/cli 并已登录')
    console.log('   安装: npm i -g @cloudbase/cli')
    console.log('   登录: cloudbase login')
  }
}

async function buildH5() {
  console.log('\n🌐 构建 H5...\n')
  run('npm run build:h5')
  console.log('\n✅ H5 构建完成，输出目录: dist/build/h5')
  console.log('   部署到 Vercel: Git 推送后 Vercel 自动构建')
}

async function main() {
  const command = process.argv[2]

  if (command === 'cloud') {
    await deployCloudFunctions()
  } else if (command === 'h5') {
    await buildH5()
  } else {
    await buildH5()
    await deployCloudFunctions()
  }
}

main().catch(console.error)
