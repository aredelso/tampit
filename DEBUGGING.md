# Debugging Guide for TampIt

This guide covers debugging tools and techniques for developing TampIt.

## Why Did You Render

`why-did-you-render` is a development tool that helps identify unnecessary re-renders in React applications.

### Setup

The tool is already configured in `src/lib/wdyr.ts` and imported in `app/layout.tsx`. It only runs in development mode.

### Configuration

The tool tracks:
- **Hooks**: `useContext`, `useEffect`, `useMemo`, `useCallback`, `useReducer`, `useState`, `useOptimistic`
- **SWR**: Tracks re-renders from SWR data fetching
- **Log Max Props**: Shows up to 10 props that changed
- **Collapse Groups**: Groups similar re-render reasons together

### How to Use

1. **Run the dev server**:
```bash
npm run client
```

2. **Open browser DevTools** (F12 or right-click → Inspect)

3. **Look for console messages** with pattern:
```
"ComponentName" rendered while its props did not change.
```

### What the Tool Shows

When a component re-renders unnecessarily, you'll see:
- Component name
- Reason for re-render (props changed, parent re-rendered, state changed, etc.)
- Which props/state values changed
- Stack trace showing where the change came from

### Example Output

```
"CoffeeCard" rendered while its props did not change.
Props that changed:
  - (no changes detected in props)

Did you know?
It's not you. React re-renders this component because of:
  - The parent component re-rendered
  - A hook dependency changed
```

### Marking Components to Watch

To watch specific components closely, add this at the top of the component file:

```typescript
import whyDidYouRender from '@welldone-software/why-did-you-render';

CoffeeCard.whyDidYouRender = true;
```

### Common Re-render Issues Found

#### 1. Unnecessary Parent Re-renders
- **Problem**: Parent component re-renders, causing all children to re-render
- **Solution**: Use `React.memo()` to memoize components
- **Example**:
```typescript
export const CoffeeCard = React.memo(function CoffeeCard(props) {
  // component code
});
```

#### 2. Missing useCallback Dependencies
- **Problem**: Callback function is recreated on every render
- **Solution**: Use `useCallback` with proper dependencies
- **Example**:
```typescript
const handleClick = useCallback((id) => {
  addToWishlist(id);
}, [addToWishlist]); // Include dependencies
```

#### 3. Inline Object/Array Props
- **Problem**: New object/array created on every render
- **Solution**: Move outside component or use useMemo
- **Example**:
```typescript
// BAD
<Component style={{ color: 'red' }} />

// GOOD
const style = { color: 'red' };
<Component style={style} />

// OR
const style = useMemo(() => ({ color: 'red' }), []);
<Component style={style} />
```

#### 4. Context Changes Causing Cascading Re-renders
- **Problem**: Context value changes, all consumers re-render
- **Solution**: Split contexts or memoize context value
- **Example**:
```typescript
const value = useMemo(() => ({ user, theme }), [user, theme]);
<UserContext.Provider value={value}>
```

### Disabling for Production

The tool automatically disables in production (`NODE_ENV !== 'development'`), so there's no performance impact on production builds.

### Analyzing Re-render Chains

If you see a long chain of re-renders:

1. **Identify the root cause**: Look for the first component that re-rendered
2. **Trace why it re-rendered**: Check parent, state, or context changes
3. **Determine if it's necessary**: Should this component actually re-render?
4. **Fix the root cause**: Use memoization, callbacks, or context optimization

### Disabling Specific Hooks

If you want to stop tracking certain hooks, update the `trackHooks` object in `src/lib/wdyr.ts`:

```typescript
trackHooks: {
  useContext: false,  // Stop tracking useContext
  useEffect: true,
  // ... other hooks
}
```

### Performance Profiling

After identifying unnecessary re-renders, use React DevTools Profiler:

1. Open React DevTools (browser extension)
2. Go to "Profiler" tab
3. Click "Record" button
4. Interact with your app
5. Stop recording and review:
   - Which components took longest to render
   - How many times components rendered
   - Which components re-rendered unnecessarily

## Other Debugging Tools

### React DevTools
- **Install**: [React DevTools Extension](https://react-devtools-tutorial.vercel.app/)
- **Use for**: Inspecting component props, state, and tree structure

### Network Tab
- **Use for**: Checking API calls and responses
- **Look for**: Slow requests, failed mutations, unnecessary refetches

### SWR DevTools
- **Use for**: Debugging data fetching
- **Check**: Cache state, stale status, error states

### Apollo DevTools (if using GraphQL)
- **Install**: Apollo DevTools browser extension
- **Use for**: Inspecting GraphQL queries, mutations, and cache

## Best Practices for Debugging

1. **Enable why-did-you-render early**: Run it while developing new features
2. **Fix re-renders as you find them**: Don't let them accumulate
3. **Use React DevTools alongside**: Cross-reference component tree
4. **Check the console regularly**: Why-did-you-render logs to console
5. **Profile critical paths**: Use React DevTools Profiler on important user flows

## Troubleshooting

### Tool Not Working?
- Ensure `NODE_ENV === 'development'`
- Check browser console for errors
- Verify import statement: `import '@/lib/wdyr';` is in layout.tsx

### Too Much Output?
- Disable unnecessary hooks in `src/lib/wdyr.ts`
- Set `trackAllPureComponents: false` (it already is by default)
- Use console filters to hide specific component names

### Performance Impact?
- Tool only runs in development
- Use `NODE_ENV=production npm run build` to test production performance
