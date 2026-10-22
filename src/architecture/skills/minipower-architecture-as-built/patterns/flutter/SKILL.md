---
name: minipower-architecture-as-built-flutter
description: Bảng tra đọc code Flutter/Dart khi khai quật app mobile cũ — nhận diện pubspec/melos/flavor, entry main_*.dart và provider gốc, GoRouter/Navigator, Bloc/Riverpod/GetX, lifecycle State và dispose, Dio/Retrofit, form, isolate, plugin và platform channel, --dart-define. Dùng khi reverse-engineer repo Flutter, trace một screen, hiểu vì sao list không đổi sau khi tạo.
metadata:
  workflow: github
---

# Đọc code Flutter — bảng tra theo stack

Phương pháp: [reference/reading-method.md](../../reference/reading-method.md). File này chỉ nói **Flutter gọi những thứ đó là gì và tìm ở đâu**. Minipower chưa có module `mobile/`; pattern này là chỗ đứng duy nhất cho Flutter và **không** là lý do mở module (ADR-042 C1).

`build()` là hình chiếu của state. Behavior nằm ở route, callback, controller / bloc / notifier, repository.

## 1. Nhận diện repo (Pass 1)

| Tìm | Cho biết |
|-----|----------|
| `pubspec.yaml` (sdk, dependencies, assets), `analysis_options.yaml`, `melos.yaml` | Họ công cụ; monorepo |
| `lib/main.dart`, `main_dev.dart` / `main_stg.dart` / `main_prod.dart`, `bootstrap.dart` | Entry theo flavor |
| `MaterialApp` / `CupertinoApp` / `MaterialApp.router`; `ProviderScope`, `MultiProvider`, `BlocProvider`, `GetMaterialApp` | Composition root, provider gốc |
| `lib/features/<name>/{presentation,application,domain,data}` hay layer-first | Cách cắt app (L2) |
| `android/` · `ios/` · `web/` · `windows/` … | Chỉ đọc khi flow đụng permission, deep link, plugin |

Đọc `pubspec.yaml` trước khi grep mù: `go_router` / `auto_route` / `beamer` · `flutter_bloc` / `flutter_riverpod` / `provider` / `get` · `dio` / `http` / `retrofit` / `graphql` · `freezed` / `json_serializable` / `equatable` · `drift` / `isar` / `hive` / `sqflite` / `shared_preferences` / `flutter_secure_storage` · `firebase_*` / `sentry_flutter`.

## 2. Entry point (câu hỏi 4.1)

| Loại | Dấu hiệu |
|------|----------|
| Route | `initialRoute`, `GoRoute` path, deep link / app link, `redirect` |
| Người dùng | `onPressed` / `onTap` / `onSubmitted` / `onChanged`, `Form.onSaved` |
| Hệ thống | push notification handler, `AppLifecycleState`, `Timer`, stream |
| Màn hình | `initState`, provider `build`, bloc `add(Started)` |

Phân biệt **thì đọc** (route → `initState` / provider create / `add(Started)` → `build`) và **thì ghi** (callback → event / method → repository → state mới → `build` lại).

## 3. Thứ tự đọc

```text
README → pubspec → melos → main*.dart + bootstrap → App widget + router + provider gốc → redirect / guard
→ một screen của flow → bloc / notifier / controller của screen → repository → API client / local data source
→ DTO + mapper → form + validator → shared widget chỉ khi đụng → l10n / arb nếu nhãn là bằng chứng
→ flavor / dart-define → test của flow → integration_test → android/ ios/ chỉ khi cần
```

## 4. Composition (mục 5 reference)

Không có DI container trừ khi repo gắn `get_it` / `injectable`. Nối bằng **import · constructor · InheritedWidget / Provider · service locator**. Trace `Screen → bloc / notifier / controller → repository (interface) → data source`. Hỏi: provider tạo ở root, ở route, hay mỗi lần push · bloc có `close` khi pop · `get_it` singleton hay factory · hai implementation một repository — flavor nào bind.

| Tìm | Chú ý |
|-----|-------|
| `BlocProvider(create:)`, `BlocBuilder` / `BlocListener`, `buildWhen` / `listenWhen` | Bloc tạo trên route sống lâu hơn màn |
| `ref.watch` (subscribe, trong build) vs `ref.read` (một lần, trong callback) vs `ref.listen` (side effect) | `ref.read` trong `build` là bẫy |
| `context.watch` / `context.read`; `Get.put` / `Get.find` | `context.watch` đặt cao rebuild cả cây; GetX toàn cục khó thấy owner |

## 5. Navigation

| API | Tìm |
|-----|-----|
| Navigator 1 | `Navigator.push / pop(result)`, `MaterialPageRoute`, `onGenerateRoute` |
| GoRouter | `GoRoute` / `ShellRoute` / `StatefulShellRoute`, `redirect`, `pathParameters` / `queryParameters` / `extra`, `context.go` (thay stack) vs `context.push` (chồng) |
| auto_route / beamer | `@RoutePage`, `router.push`, guard |

Kiểm: path param vs `extra` — `extra` mất khi process chết · guard ở `redirect` hay chỉ ẩn nút · `pop(result)` có được caller dùng không · deep link vào đúng route · `PopScope` chặn back Android.

## 6. State (mục 6 reference)

| Loại | Dấu hiệu |
|------|----------|
| Local | `setState`, `ValueNotifier` trong `State` |
| Inherited | `InheritedWidget`, Provider ở cây con |
| Route | path / query / `extra` |
| App-wide | Bloc / Notifier / GetX ở root |
| Form | `TextEditingController`, `FormState`, `flutter_form_builder` |
| Persistence | `shared_preferences`, secure storage, drift / isar / hive / sqflite |

Bloc: `add(Event) → on<Event> → emit(State) → BlocBuilder`; transformer `droppable` / `restartable` / `concurrent` quyết định race. Riverpod: `ref.watch → Notifier / AsyncNotifier → state = → rebuild`; `AsyncValue.guard`. Sau mutation: `emit` cùng bloc · reload sau `pop(result)` · `ref.invalidate` · ghi DB rồi UI `watch` stream · optimistic + rollback.

## 7. Lifecycle · async · nền

`createState → initState → didChangeDependencies → build → didUpdateWidget → dispose`. Kiểm `dispose` huỷ subscription / controller / timer; `context.mounted` sau `await`; `FutureBuilder` tạo lại future trong `build`; `IndexedStack` / `TabBarView` có dispose khi đổi tab. `async/await` tuần tự trên isolate UI — song song thật là `Future.wait` hoặc `compute` / `Isolate.spawn`. Nền: `Workmanager`, `firebase_messaging` background handler (đăng ký trước `runApp`), `MethodChannel` / `EventChannel` / Pigeon / FFI.

## 8. Data · repository · form

Flow đọc: `Started / AsyncNotifier.build / initState → Repository → Dio / http / graphql → fromJson → state → BlocBuilder / ref.watch`. Flow ghi: `onPressed → Submit → Repository.create → API → emit → listener (navigate, SnackBar, refresh)`. Tìm `Dio` + `InterceptorsWrapper`, Retrofit `@GET/@POST`, `freezed` state, `AsyncValue`, `CancelToken`. Form: `Form` + `GlobalKey<FormState>` + `TextFormField`, `validator`, `onSaved`; kiểm mask tiền / ngày, lỗi từ validator hay API 400, controller giữ dữ liệu cũ khi đổi id, double tap, `dispose` controller.

## 9. Auth · lỗi · observability

Auth: `AuthBloc` / `authProvider`, `GoRouter.redirect`, `flutter_secure_storage`, interceptor gắn `Authorization`, refresh token, role trên state; logout xoá bloc / DB cache / secure storage nào. Lỗi: `try/catch`, `Either` / `Result` / `Failure`, `AsyncValue.guard`, `BlocObserver.onError`, `FlutterError.onError`, `PlatformDispatcher.instance.onError`, `runZonedGuarded`, `ErrorWidget.builder`; `catch (_)` nuốt lỗi là behavior. Observability: `sentry_flutter` / `firebase_crashlytics`, `BlocObserver` / `ProviderObserver`, `NavigatorObserver`, analytics.

## 10. Config · flavor · runtime

`main_<flavor>.dart` → `--dart-define` / `--dart-define-from-file` → lớp `Env` / `Flavor` → Firebase options / API URL / feature flag. `productFlavors` Android, scheme iOS, `google-services.json` / `GoogleService-Info.plist` theo flavor. `--dart-define` lộ trong binary. Base URL trong `main_dev.dart` không phải contract production. Không ghi giá trị secret.

## 11. Tests là bằng chứng

`testWidgets`, `pumpWidget` / `pumpAndSettle`, `blocTest`, `ProviderContainer`, `mocktail` / `mockito`, mock adapter Dio, `integration_test` / patrol, golden (chỉ khi câu hỏi là hình dạng UI). Harness bọc `pumpWidget` lộ dependency cần (router, provider, l10n).

## 12. Bẫy riêng Flutter

- Side effect (API, `Navigator`) trong `build()`.
- `ref.read` trong `build` — đọc một lần, không subscribe.
- Bloc event `concurrent` khi đổi id nhanh — bản cũ ghi đè bản mới.
- `extra` làm nguồn duy nhất của màn chi tiết — mất sau khi app bị giết.
- `pumpAndSettle` treo vì animation lặp — không suy ra production treo.
- Ẩn nút theo role nhưng interceptor vẫn gửi request — ghi `[Chưa xác minh]` cho lớp enforce.
