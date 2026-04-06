# TODOS

## Phase 2: ワークフローナビゲーション
**What:** 5ステップワークフロー（ポリマー選択→溶媒候補→実験入力→比較→推奨）を実装
**Why:** Phase 1で実験データ統合を実現した後、個別パイプラインの「点」を連続フローの「線」に変える
**Pros:** ユーザー体験が劇的に向上、研究者も産業エンジニアもカバー
**Cons:** UI設計が複雑、状態管理エンジンの実装量が大きい
**Context:** React Context + useReducer で各ステップの入出力を保持。まず主要3パイプライン（溶解性、分散性、接着性）に提供。設計書の Phase 2 セクション参照: ~/.gstack/projects/YukiKudo03-hansen-solubility-tool/yukky-master-design-20260407-060706.md
**Depends on:** Phase 1（experimental_results テーブル + CSVインポート + 3Dオーバーレイ）完了

## DESIGN.md 作成 — デザイントークン文書化
**What:** 既存UIパターン（カード、ボタン、バナー、モーダル）をDESIGN.mdに文書化
**Why:** 93タブのUIに一貫したパターンがあるが文書化されていない。新機能追加時にパターンが崩れるリスク
**Pros:** 開発速度向上、デザイン一貫性保証、新規コントリビューター向けガイド
**Cons:** 文書のメンテナンスコスト（軽微）
**Context:** 既存パターン: bg-white rounded-lg shadow p-6 カード、bg-blue-600 primary button、bg-red-50/bg-yellow-50 バナー、MD3 navigation tokens。Phase 1で新規追加: モーダルパターン（fixed overlay + white card + ESC/overlay close）
**Depends on:** Phase 1完了後
