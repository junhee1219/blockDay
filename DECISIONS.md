# BlockDay 설계 결정 기록

프로덕트를 만들면서 내렸던 결정들과 요청 사항을 정리한 문서.
나중에 수정하거나 확장할 때 "왜 이렇게 만들었지?" 할 때 참고.

---

## 핵심 철학

- **쉽고 + 간편하고 + 직관적이고 + 글씨 큼직큼직하게**
- 어른들도 문제없이 볼 수 있을 정도로 큰 UI
- 바텀시트나 모달 같은 복잡한 UI 패턴 지양
- 메인 화면에서 바로 모든 것을 할 수 있어야 함

---

## 기능 결정

### 활동 (Activity)
- 유저가 이름 + 색상으로 직접 생성
- 메인 화면 탭 한번으로 다음 활동으로 전환 (순환)
- 길게 눌러서 정지
- **10초 미만 활동은 기록하지 않음** — 탭탭 빠르게 넘기면서 원하는 활동 찾을 때 중간 것들이 쓸데없이 기록되는 것 방지
- 10초 프로그레스 바 + "탭하면 건너뜀" / "기록 중" 상태 표시로 우아하게 표현

### 이벤트 (Event)
- 시간이 아닌 순간 기록 (예: 물 마심, 약 먹기)
- 탭하면 바로 기록됨 (타이머 없음)
- **메인 화면에 바로 표시** — 별도 "+" 버튼이나 바텀시트 없이 직접 접근
- 여러 개일 때 가로 스와이프로 탐색 가능

### 타임라인
- 오늘 하루를 시각적으로 확인
- 활동별 총 시간 요약 (바 차트 + 리스트)
- 시간대별 상세 기록 (활동명 + 소요 시간 + 시간 범위)
- 이벤트도 시간대에 표시

### 24시간+ 기록 & 백그라운드
- 24시간 이상 연속 기록 지원 (일 단위 표시)
- 백그라운드에서도 정확한 시간 유지 (timestamp 기반 계산)
- `visibilitychange` / `focus` / `pageshow` 이벤트로 복귀 시 즉시 동기화
- 날짜를 걸치는 로그도 타임라인에 표시

---

## UI/UX 결정

### "진행 중" 라벨 제거
- 활동명 + 타이머가 돌아가고 있으면 진행 중인 거 이미 직관적으로 알 수 있음
- 빼는 게 더 깔끔함

### 그라데이션
- 배경: 활동 색상 기반 대각선 그라데이션 (어두운 → 원래 → 밝은)
- 텍스트: 위에서 아래로 흰색 → 반투명 그라데이션
- 온보딩: 보라빛 다크 그라데이션

### 폰트
- Apple SD Gothic Neo 우선 적용 (Apple 기기 최적화)
- Fallback: system-ui, Pretendard, Noto Sans KR 순

### 글씨 크기
- 활동명: 64px (extrabold)
- 타이머: 84px (extralight)
- 타임라인 제목: 34px
- 활동 요약: 19px
- 힌트 텍스트: 15~18px
- 전체적으로 "작은 글씨 없는" 원칙

### 네비게이션
- 하단 3탭: 기록 / 타임라인 / 설정
- "+" 버튼 제거 (이벤트를 메인 화면으로 이동했으므로)
- Framer Motion `layoutId`로 탭 전환 애니메이션

### 이벤트 버튼
- 메인 화면 하단에 pill 형태로 직접 표시
- 반투명 배경 + backdrop-blur
- 탭하면 시각적 피드백 (밝아짐)
- 3개 이하면 가운데 정렬, 많으면 스크롤
- 터치 이벤트 전파 차단 (스와이프 시 활동 전환 방지)

---

## 기술 결정

### 스택
- **Vite 8** + React + TypeScript
- **Tailwind CSS v4** (`@theme inline`, `@layer base` 사용)
- **Zustand** — 상태 관리
- **Dexie.js** — IndexedDB 래퍼 (로컬 영구 저장)
- **Framer Motion** — 애니메이션

### 데이터 저장
- IndexedDB (Dexie.js)로 브라우저에 영구 저장
- 서버 없음, 로컬 전용
- 브라우저 데이터 삭제 시 날아감 (백업 기능 추후 고려)

### 배포
- GitHub Pages + GitHub Actions 자동 배포
- Vite `base: '/blockDay/'` 설정
- PWA manifest도 `/blockDay/` 기준 경로

### PWA
- 수동 `manifest.json` (vite-plugin-pwa가 Vite 8과 호환 안 됨)
- `start_url`, `scope`, 아이콘 경로 모두 `/blockDay/` 접두사
- **주소 변경 시 `manifest.json` + `vite.config.ts`의 `base` 같이 수정 필요**

### Tailwind v4 주의사항
- `@layer` 바깥에 정의된 CSS가 `@layer utilities`보다 우선순위 높음
- 글로벌 리셋(`*`)은 반드시 `@layer base` 안에 넣어야 Tailwind 클래스가 정상 동작

---

## 파일 구조 요약

```
src/
  components/
    MainScreen.tsx    — 메인 기록 화면 (탭 전환, 타이머, 이벤트 버튼)
    TimelineScreen.tsx — 타임라인 (요약 + 시간대별 상세)
    SettingsScreen.tsx — 활동/이벤트 관리
    Navigation.tsx     — 하단 3탭 네비게이션
  stores/
    useActivityStore.ts — 활동 + 추적 상태 (10초 미만 삭제 로직 포함)
    useEventStore.ts    — 이벤트 타입 + 기록
  hooks/
    useTimer.ts         — 타이머 (백그라운드 복귀 대응)
    useTodayLogs.ts     — 오늘 로그 조회 (날짜 걸침 대응)
  db/
    index.ts            — Dexie DB 스키마
  types/
    index.ts            — Activity, EventType, ActivityLog, EventLog 타입
```
