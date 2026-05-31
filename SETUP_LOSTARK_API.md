# Lost Ark Open API 자동 조회 연결 방법

이 패키지는 기존 최종본에 캐릭터 자동 조회용 Supabase Edge Function을 추가한 버전입니다.

## 1. Supabase CLI 설치

Windows 기준으로 가장 쉬운 방법은 PowerShell에서 npm을 사용하는 것입니다.

```powershell
npm install -g supabase
```

설치 확인:

```powershell
supabase --version
```

npm이 없다면 Node.js LTS를 먼저 설치해야 합니다.

## 2. Supabase 로그인

```powershell
supabase login
```

브라우저가 열리면 Supabase 계정으로 로그인합니다.

## 3. 프로젝트 연결

Supabase 프로젝트의 Reference ID가 필요합니다.

Supabase → Project Settings → General → Reference ID 확인

그 다음 이 폴더에서 아래 명령 실행:

```powershell
supabase link --project-ref 여기에_Reference_ID
```

## 4. JWT를 Supabase Secret으로 저장

아래 명령에서 `복사한_LOSTARK_JWT` 부분에 발급받은 JWT를 넣습니다.

```powershell
supabase secrets set LOSTARK_JWT="복사한_LOSTARK_JWT"
```

주의:
- JWT는 index.html에 넣지 않습니다.
- GitHub에 올리지 않습니다.
- 채팅창에 붙여넣지 않습니다.

## 5. Edge Function 배포

이 패키지 폴더에서 실행:

```powershell
supabase functions deploy lostark-profile
```

## 6. 테스트

배포 후 홈페이지에서 캐릭터 추가 → 캐릭터명 입력 → 조회 버튼을 누르면 아래 값이 자동 입력됩니다.

- 캐릭터명
- 서버명
- 클래스명
- 아이템 레벨
- 전투력

## 7. GitHub 업로드 시 포함할 파일

업로드:
- index.html
- README.md

업로드해도 되는 파일:
- supabase-schema-v6.sql
- supabase/functions/lostark-profile/index.ts

업로드하면 안 되는 것:
- JWT 값
- .env 파일
- Supabase secret 값

