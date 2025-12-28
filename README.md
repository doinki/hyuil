# hyuil

한국의 공휴일을 조회할 수 있는 MCP (Model Context Protocol) 서버입니다. `hyuil`은 한국어 `휴일`을 영어로 표현한 이름입니다.

## 개요

이 프로젝트는 [공공데이터포털](https://www.data.go.kr/tcs/dss/selectApiDataDetailView.do?publicDataPk=15012690)의 공휴일 정보 API를 활용하여 한국의 공휴일을 조회할 수 있는 MCP 서버를 제공합니다.

## 기능

- **연도별 공휴일 조회**: 특정 연도의 모든 공휴일 목록을 조회할 수 있습니다.
- **월별 공휴일 조회**: 특정 연도와 월의 공휴일 목록을 조회할 수 있습니다.
- **날짜별 공휴일 확인**: 특정 날짜가 공휴일인지 확인하고, 공휴일인 경우 휴일 정보를 반환합니다.

## 사용 방법

### MCP 서버 설정

MCP 클라이언트(예: Claude Desktop, Cursor 등)에서 다음과 같이 설정합니다:

```json
{
  "mcpServers": {
    "hyuil": {
      "command": "npx",
      "args": ["-y", "hyuil"]
    }
  }
}
```

### 제공되는 툴

#### `get_holiday`

한국의 공휴일을 조회합니다.

**파라미터:**

- `year` (필수): 조회할 연도 (예: 2026)
- `month` (선택): 조회할 월 (1-12)
- `day` (선택): 조회할 일 (1-31)

**사용 예시:**

1. **연도만 제공**: 해당 연도의 모든 공휴일 목록을 반환합니다.

   ```json
   {
     "year": 2026
   }
   ```

2. **연도와 월 제공**: 해당 연도와 월의 공휴일 목록을 반환합니다.

   ```json
   {
     "year": 2026,
     "month": 1
   }
   ```

3. **연도, 월, 일 모두 제공**: 해당 날짜가 공휴일인지 확인하고, 공휴일인 경우 휴일 정보를 반환합니다.
   ```json
   {
     "year": 2026,
     "month": 1,
     "day": 1
   }
   ```

**응답 형식:**

- 연도별 조회:

  ```json
  {
    "holidays": [
      { "date": "2026-01-01", "isHoliday": true, "name": "1월1일" },
      { "date": "2026-02-16", "isHoliday": true, "name": "설날" },
      { "date": "2026-02-17", "isHoliday": true, "name": "설날" },
      { "date": "2026-02-18", "isHoliday": true, "name": "설날" },
      { "date": "2026-03-01", "isHoliday": true, "name": "삼일절" },
      { "date": "2026-03-02", "isHoliday": true, "name": "대체공휴일(삼일절)" },
      { "date": "2026-05-05", "isHoliday": true, "name": "어린이날" },
      { "date": "2026-05-24", "isHoliday": true, "name": "부처님오신날" },
      { "date": "2026-05-25", "isHoliday": true, "name": "대체공휴일(부처님오신날)" },
      { "date": "2026-06-03", "isHoliday": true, "name": "전국동시지방선거" },
      { "date": "2026-06-06", "isHoliday": true, "name": "현충일" },
      { "date": "2026-08-15", "isHoliday": true, "name": "광복절" },
      { "date": "2026-08-17", "isHoliday": true, "name": "대체공휴일(광복절)" },
      { "date": "2026-09-24", "isHoliday": true, "name": "추석" },
      { "date": "2026-09-25", "isHoliday": true, "name": "추석" },
      { "date": "2026-09-26", "isHoliday": true, "name": "추석" },
      { "date": "2026-10-03", "isHoliday": true, "name": "개천절" },
      { "date": "2026-10-05", "isHoliday": true, "name": "대체공휴일(개천절)" },
      { "date": "2026-10-09", "isHoliday": true, "name": "한글날" },
      { "date": "2026-12-25", "isHoliday": true, "name": "기독탄신일" }
    ],
    "year": 2026
  }
  ```

- 월별 조회:

  ```json
  {
    "holidays": [{ "date": "2026-01-01", "isHoliday": true, "name": "1월1일" }],
    "month": 1,
    "year": 2026
  }
  ```

- 날짜별 조회 (공휴일인 경우):

  ```json
  {
    "day": 1,
    "holiday": { "date": "2026-01-01", "isHoliday": true, "name": "1월1일" },
    "isHoliday": true,
    "month": 1,
    "year": 2026
  }
  ```

- 날짜별 조회 (공휴일이 아닌 경우):
  ```json
  {
    "day": 2,
    "holiday": null,
    "isHoliday": false,
    "month": 1,
    "year": 2026
  }
  ```
