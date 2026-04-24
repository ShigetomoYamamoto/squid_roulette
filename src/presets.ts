import type { Preset } from './storage'

export const BUILTIN_PRESETS: Preset[] = [
  { name: '今日のランチ', items: ['ラーメン', 'カレー', '寿司', 'パスタ', '定食', 'ハンバーガー'] },
  { name: '番号抽選 1-10', items: Array.from({ length: 10 }, (_, i) => String(i + 1)) },
  { name: 'YES / NO / もう一度', items: ['YES', 'NO', 'もう一度'] },
  { name: 'じゃんけん', items: ['グー', 'チョキ', 'パー'] },
  { name: '罰ゲーム', items: ['腕立て10回', 'スクワット20回', '早口言葉', '物まね', '告白タイム', 'セーフ'] },
  { name: '韓国料理', items: ['スンデ', 'トッポッキ', 'キンパ', 'ビビンバ', 'チヂミ', 'サムギョプサル'] },
]
