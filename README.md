# GEARSHED — Timeline

일렉트릭 기타의 역사를 스크롤로 따라가는 타임라인 (웹디자인II).
현재 공개 범위: Frying Pan(1931) · ES-150(1936) · ES-175(1949) · Telecaster(1951, 3D)

## 구성

| 경로 | 내용 |
|---|---|
| `index.html` | 페이지 |
| `css/timeline.css` | 스타일 |
| `js/timeline.js` | 타임라인 조립·스크롤 연출 (`BUILD_UNTIL` 챕터까지만 그림) |
| `js/model3d.js` | Telecaster 챕터의 3D 뷰어 |
| `js/silhouettes.js`, `js/media.js` | 실루엣, 이미지 배경 제거 |
| `data/timeline.{en,ko,ja}.json` | 언어별 본문 |
| `assets/models/<챕터>/` | 챕터별 이미지와 3D 모델 (페이지에서 쓰는 파일만) |

three.js, Draco·KTX2 디코더, 웹폰트, YouTube 영상은 CDN에서 불러옵니다.

## GitHub Pages로 공개하기

`esquire.glb`(47MB)는 GitHub 웹 업로드 한도(파일당 25MB)를 넘으므로 **GitHub Desktop**으로 올립니다.

1. GitHub Desktop → File → Add Local Repository → 이 폴더 선택 → `create a repository` → Create Repository
2. Publish repository — 무료 계정은 `Keep this code private`를 해제해야 Pages를 쓸 수 있습니다
3. GitHub 저장소 → Settings → Pages → Source `Deploy from a branch`, Branch `main` / `(root)` → Save
4. 몇 분 뒤 `https://<아이디>.github.io/<저장소 이름>/` 에서 열립니다

`index.html`을 파일로 직접 열면 동작하지 않습니다 (모듈·데이터 로딩에 웹 서버가 필요).

## 크레딧

3D 모델 — “Fender Custom Shop 1950 Esquire Heavy Relic” by sgab_viz, [Sketchfab](https://sketchfab.com/3d-models/fender-custom-shop-1950-esquire-heavy-relic-e8fa98de26194d01867e4d4b4dd45772), [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/).
형상은 원본 그대로이고, 웹용으로 압축했습니다 (형상 Draco, 텍스처 KTX2/JPEG). 비상업적 용도로만 사용합니다.
