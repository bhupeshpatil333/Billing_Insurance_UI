# 🧪 RxJS Mastery Guide in BIMS

This guide explains the three most important RxJS concepts used in the **Billing & Insurance Management System (BIMS)**.

---

## 1. Observable 📡
**Definition**: A stream of data that can be observed over time. It is **unicast** (each subscriber gets its own independent execution).
**In BIMS**: Primarily used for HTTP requests. Once the data is received, the stream completes.

### 📁 Example: `AuthService`
```typescript
// auth.service.ts
login(data: any): Observable<LoginResponse> {
  return this.http.post<ApiResponse<LoginResponse>>(`${this.api}/login`, data);
}
```

### 📤 Output Flow:
1.  **Component Subscribes**: `authService.login(form).subscribe(res => ...)`
2.  **Request Sent**: The HTTP call is made.
3.  **Data Received**: `res` contains the `LoginResponse`.
4.  **Completion**: The Observable "dies" (closes) automatically after the response.

---

## 2. Subject 📢
**Definition**: A special type of Observable that is **multicast** (can talk to many observers at once). It does **not** hold a value.
**In BIMS**: Used for technical cleanup to prevent memory leaks.

### 📁 Example: `BillFormComponent`
```typescript
// bill-form.component.ts
private destroy$ = new Subject<void>();

ngOnDestroy() {
  this.destroy$.next(); // Emit signal to stop all subscriptions
  this.destroy$.complete();
}
```

### 📤 Output Flow:
1.  **Component Created**: `destroy$` is empty.
2.  **Component Destroyed**: `destroy$.next()` emits `undefined`.
3.  **Effect**: Any stream using `.pipe(takeUntil(this.destroy$))` will immediately stop.
4.  **Key Point**: If you subscribe **after** `.next()` is called, you get **nothing**.

---

## 3. BehaviorSubject 🧠
**Definition**: A type of Subject that **holds a value** and requires an initial value. Subscribers always get the **current value** immediately upon subscribing.
**In BIMS**: Used for managing global "Application State" like standard Login status.

### 📁 Example: `AuthService`
```typescript
// auth.service.ts
// 1. Initial State: check if user is already logged in
private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.isLoggedIn());

// 2. Expose as Observable (Read-only for components)
public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

// 3. Update state when login/logout happens
logout() {
  localStorage.clear();
  this.isAuthenticatedSubject.next(false); // Emit new state
}
```

### 📤 Output Flow:
1.  **Subscription A (at startup)**: Immediately receives `true` or `false` (stored in memory).
2.  **Login Action**: `next(true)` is called. Subscriber A gets `true`.
3.  **Subscription B (joins late)**: Immediately receives `true` (the "cached" value).
4.  **Key Point**: Perfect for UI elements like the Sidebar or Header that need to know the login status at any time.

---

## 📊 Summary Comparison

| Feature | Observable | Subject | BehaviorSubject |
| :--- | :--- | :--- | :--- |
| **Initial Value** | ❌ None | ❌ None | ✅ Required |
| **Holds Memory?** | ❌ No | ❌ No | ✅ Yes (Current value) |
| **Multicast?** | ❌ No (Unicast) | ✅ Yes | ✅ Yes |
| **Use Case** | API Calls | Events / Cleanup | App State (Login, Theme) |

---

## 💡 Pro Tip for Interviews
> "In our project, we use **BehaviorSubject** in the `AuthService` to track if the user is logged in. This ensures that even if a component (like the Sidebar) loads late, it still knows the correct authentication state immediately."
