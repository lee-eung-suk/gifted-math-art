# 도형이 예술이 되는 시간 — 수학영재반 수업 사이트

응석쌤 수학영재수업용. 패턴블럭 → 생성형 AI 스타일 바꾸기 → 테셀레이션 → 머그컵 전사.

- `index.html` — 학생용 수업 페이지 (꼭짓점 실험실, 웹 패턴블럭, 프롬프트 조립기·복사, 테셀레이션 만들기, 머그컵 미리보기·좌우반전 도안, 작품 올리기)
- `teacher.html` — 교사용 작품함 (비밀번호 → 작품 보기, 프롬프트 복사, 개별/ZIP 다운로드, 삭제)
- `api/` — Vercel 서버 함수 (Vercel Blob 무료 저장소에 이미지 저장)

## 배포 (GitHub + Vercel, 무료 Hobby 플랜)

1. 이 폴더를 GitHub 새 저장소에 올리기
   ```bash
   cd gifted-math-art
   git init && git add . && git commit -m "수학영재반 사이트"
   gh repo create gifted-math-art --private --source=. --push
   ```
2. vercel.com → **Add New → Project** → 방금 만든 저장소 Import → Deploy (설정 그대로)
3. 프로젝트 → **Storage → Create → Blob** → 이름 입력 → 접근 방식 **Private** 권장 → 이 프로젝트에 Connect
   (환경변수 `BLOB_READ_WRITE_TOKEN`이 자동으로 들어갑니다. Public 저장소도 자동으로 인식해요.)
4. 프로젝트 → **Settings → Environment Variables**
   - `TEACHER_PASSWORD` = 교사용 작품함 비밀번호 (필수)
   - `CLASS_CODE` = 학생이 올릴 때 넣을 수업 코드 (선택 — 정하면 아무나 못 올림)
5. **Deployments → 최신 배포 ⋯ → Redeploy** (환경변수 적용)

학생 주소: `https://<프로젝트>.vercel.app` · 교사 주소: `https://<프로젝트>.vercel.app/teacher.html`

## 참고

- 학생 사진은 브라우저에서 1600px JPEG로 줄여서 올라갑니다(최대 3MB). Blob 무료 한도 안에서 충분히 쓸 수 있어요.
- 학기가 끝나면 교사용 작품함에서 ZIP으로 받고 삭제하면 저장 공간이 비워집니다.
- 컵 도안: 21cm × 8.8cm, 300dpi (11온스 머그 기준). 머그 크기가 다르면 `assets/app.js`의 `PRINT_W`, `PRINT_H`를 바꾸세요.
