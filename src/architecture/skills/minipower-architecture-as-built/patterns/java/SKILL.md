---
name: minipower-architecture-as-built-java
description: Bảng tra đọc code Java/Spring khi khai quật hệ cũ — nhận diện Maven/Gradle, entry point Spring (@RestController, @KafkaListener, @Scheduled, ApplicationRunner), DI và @Qualifier, AOP (@Transactional, @Async, @Cacheable), filter/interceptor, JPA/Hibernate, Kafka/RabbitMQ, Spring Security, application.yml. Dùng khi reverse-engineer repo Java, đọc Spring Boot, trace một endpoint hay consumer.
metadata:
  workflow: github
---

# Đọc code Java / Spring — bảng tra theo stack

Phương pháp: [reference/reading-method.md](../../reference/reading-method.md). File này chỉ nói **Java / Spring gọi những thứ đó là gì và tìm ở đâu**. Không dùng Spring thì thay bằng framework tương ứng (Jakarta EE, Micronaut, Quarkus) — cột "Dấu hiệu" đổi, câu hỏi không đổi.

## 1. Nhận diện repo (Pass 1)

| Tìm | Cho biết |
|-----|----------|
| `pom.xml` / `build.gradle(.kts)`, `settings.gradle(.kts)`, module con | Số module, dependency, plugin |
| `src/main/java` · `src/main/resources` · `src/test/java` | Code, config, test |
| `@SpringBootApplication`, `@Configuration`, `@ComponentScan`, `@EnableConfigurationProperties` | Composition root, phạm vi scan |
| Package `api` · `application` · `domain` · `infrastructure` · `messaging` · `integration` | Layer và module (L2) |
| `Dockerfile`, `docker-compose*`, `k8s/`, `helm/`, `bootstrap.yml`, Config Server | Runtime và deploy |

## 2. Entry point (câu hỏi 4.1)

| Loại | Dấu hiệu |
|------|----------|
| HTTP | `@RestController` / `@Controller`, `@RequestMapping`, `@GetMapping` / `@PostMapping`…, WebFlux `RouterFunction` |
| Message | `@KafkaListener`, `@RabbitListener`, `@JmsListener`, `@StreamListener` / `Consumer<T>` bean |
| Nền | `@Scheduled`, Quartz `Job`, Spring Batch `Job` / `Step`, `ApplicationRunner`, `CommandLineRunner` |
| Event nội bộ | `@EventListener`, `@TransactionalEventListener` |
| gRPC / GraphQL | `@GrpcService`, `@QueryMapping` / `@MutationMapping` |

## 3. Thứ tự đọc

```text
README → pom / gradle → main class → Spring configuration → bean registration → filter / interceptor
→ security config → controller → consumer / producer → application service → domain → repository
→ JPA mapping → JPQL / Criteria / native SQL → external client → scheduler / batch → application.yml → tests
```

## 4. Composition — DI (mục 5 reference)

| Tìm | Chú ý |
|-----|-------|
| `@Service`, `@Repository`, `@Component`, `@Bean`, constructor injection | Implementation thật được inject |
| `@Primary`, `@Qualifier`, `@Conditional*`, `@Profile` | Nhiều implementation; cái nào thắng ở môi trường nào |
| Factory method, `ObjectProvider`, `@Lazy` | Khởi tạo trễ, vòng phụ thuộc |

**AOP — behavior ngoài thân method:** `@Transactional` (boundary, propagation, rollbackFor), `@Async` (thread pool nào), `@Cacheable` / `@CacheEvict`, `@Retryable`, `@CircuitBreaker` (Resilience4j), `@PreAuthorize` / `@Secured`, `@Validated`; `Aspect`, `HandlerInterceptor`, `OncePerRequestFilter`, `BeanPostProcessor`. Method làm nhiều hơn thân nó → tìm annotation và aspect.

## 5. Web flow (mục 5, 7 reference)

```text
HTTP → Filter → Interceptor → @ControllerAdvice (exception) → Controller (@Valid) → Service → Repository → Response
```

Tìm `@ControllerAdvice` / `@ExceptionHandler`, `@Valid` / `@Validated`, serialization (Jackson config), logging / tracing filter.

## 6. Persistence (mục 6 reference)

| JPA / Hibernate | Khác |
|-----------------|------|
| `@Entity`, `@Table`, `@Id`, `@OneToMany` / `@ManyToOne` / `@ManyToMany`, `@JoinColumn`, `@Embedded`, `@Version` | jOOQ, MyBatis mapper XML, `JdbcTemplate`, native SQL |
| Repository method → JPQL / Criteria / `@Query` → bảng thật → transaction | Stored procedure, migration (Flyway / Liquibase) là bằng chứng schema thật |
| Kiểm lazy / eager, cascade, fetch join, N+1, optimistic / pessimistic lock, propagation, isolation | Chỉ ghi khi source cho thấy thực sự dùng |

## 7. Messaging · async · concurrency

| Chủ đề | Tìm |
|--------|-----|
| Kafka | `KafkaTemplate`, `@KafkaListener`, topic · key · partition · serializer · consumer group · retry · DLT |
| RabbitMQ | `RabbitTemplate`, `@RabbitListener`, exchange · binding · queue · ack · DLQ |
| Async | `@Async` + executor nào, `CompletableFuture`, `ExecutorService`, reactor `Mono/Flux` |
| Nền | `@Scheduled` (single thread mặc định), Quartz, Spring Batch; lock phân tán (ShedLock), idempotency |

## 8. Security (mục 7 reference)

`SecurityFilterChain`, `HttpSecurity`, `AuthenticationProvider`, `GrantedAuthority`, `@PreAuthorize` / `@Secured` / `@RolesAllowed`, JWT / OAuth2 / OIDC resource server. Trả lời: quyền kiểm ở endpoint hay service; tenant tách ở filter, `@Filter` Hibernate hay schema.

## 9. Lỗi

`@ControllerAdvice`, `@ExceptionHandler`, `ResponseStatusException`, `ProblemDetail` (Spring 6), custom exception, Resilience4j retry / circuit breaker / fallback. `catch (Exception e) { log }` nuốt lỗi là behavior.

## 10. Config · runtime

`application.yml/properties` → `application-{profile}` → `bootstrap.yml` / Config Server → env → `@ConfigurationProperties` / `@Value`. Profile đang bật quyết định bean nào sống. Docker / K8s / Helm cũng là config. Không ghi giá trị secret.

## 11. Observability

SLF4J / Logback (MDC trace id), Micrometer `Meter`, OpenTelemetry / Sleuth, Actuator (`/actuator/health`, `/actuator/metrics`). Ghi correlation id đi qua filter nào.

## 12. Tests là bằng chứng

`@Test`, `@SpringBootTest`, `@WebMvcTest`, `@DataJpaTest`, `@MockBean`, Mockito, Testcontainers, WireMock, Spring Cloud Contract. Slice test lộ dependency thật của một lớp.

## 13. Bẫy riêng Java / Spring

- `@Transactional` trên method `private` hoặc gọi nội bộ cùng class — không có proxy, không có transaction.
- `@Async` không có executor cấu hình — chạy trên pool mặc định không giới hạn.
- `@Scheduled` nhiều job một thread — job chậm chặn job khác.
- `LazyInitializationException` ngoài session — DTO mapping ở controller đụng lazy collection.
- `@Profile` bật sai → bean mock lọt production.
