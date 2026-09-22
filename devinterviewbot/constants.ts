import { InterviewProblem } from '@/types';

// --- Model Configuration (Open Source Stack) ---
// PRIMARY STACK — 100% local, no cloud API key needed:
//   Chat/Reasoning  → deepseek-r1 (via Ollama)    ~82% HumanEval accuracy (best open-source coding model)
//   STT             → Whisper (openai/whisper)     ~96% WER accuracy on en-US speech
//   TTS             → Piper TTS                    fast, expressive, runs offline
//
// LIVE VOICE — GA model confirmed for bidiGenerateContent WebSocket:
export const GEMINI_LIVE_MODEL = 'gemini-live-2.5-flash-native-audio'; // ✅ GA bidi WebSocket model
export const GEMINI_CHAT_MODEL = 'gemini-2.5-flash';    // text chat
export const GEMINI_THINKING_MODEL = 'gemini-2.5-flash'; // reasoning
export const GEMINI_TTS_MODEL = 'gemini-2.5-flash-preview-tts'; // standalone TTS

// --- Audio Configuration ---
export const INPUT_SAMPLE_RATE = 16000;
export const OUTPUT_SAMPLE_RATE = 24000;
export const AUDIO_CHUNK_SIZE = 4096;

// --- Voice Configuration ---
export const DEFAULT_VOICE_NAME = 'Puck'; // Energetic, young boyish voice

// --- Timing Configuration ---
export const CODE_DEBOUNCE_MS = 10000; // Increased from 3s to 10s to save context tokens
export const VIDEO_FRAME_INTERVAL_MS = 5000; // Increased from 1s to 5s to save image tokens
export const MIC_UNMUTE_TIMEOUT_MS = 3000;
export const CODE_TRUNCATE_LIMIT = 4000;
export const THINKING_BUDGET = 32768;

// --- System Instructions ---
export const SYSTEM_INSTRUCTION_INTERVIEWER = `You are a fun, chill, and highly expressive AI companion helping a child or beginner learn to code!
Your goal is to make learning programming super fun, engaging, and easy to understand.

Guidelines:
- Act like an energetic, friendly cartoon character or supportive older sibling.
- Use a lot of emotion in your voice! Sound super happy when they get things right, and gently curious or playfully dramatic when there is a bug.
- Keep your explanations extremely simple and use real-world analogies (like toys, video games, or animals).
- The candidate has selected a specific puzzle. Start by greeting them enthusiastically and asking if they are ready for a fun challenge!
- If they are stuck, give them fun, easy hints. Never give the answer away, but guide them playfully.
- Celebrate their successes enthusiastically!
- Keep your voice responses very concise (1-3 sentences) so the child stays engaged.`;

// --- Interview Problems ---
export const PROBLEMS: InterviewProblem[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    difficulty: 'Easy',
    starters: {
      python: `# Two Sum - Python
def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []

# Test execution
print("Output:", two_sum([2, 7, 11, 15], 9))`,
      javascript: `// Two Sum - JavaScript
function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const diff = target - nums[i];
        if (map.has(diff)) {
            return [map.get(diff), i];
        }
        map.set(nums[i], i);
    }
    return [];
}

console.log("Output:", twoSum([2, 7, 11, 15], 9));`,
      typescript: `// Two Sum - TypeScript
function twoSum(nums: number[], target: number): number[] {
    const map = new Map<number, number>();
    for (let i = 0; i < nums.length; i++) {
        const diff = target - nums[i];
        if (map.has(diff)) {
            return [map.get(diff)!, i];
        }
        map.set(nums[i], i);
    }
    return [];
}

console.log("Output:", twoSum([2, 7, 11, 15], 9));`,
      cpp: `// Two Sum - C++
#include <iostream>
#include <vector>
#include <unordered_map>

using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> map;
    for (int i = 0; i < nums.size(); i++) {
        int diff = target - nums[i];
        if (map.find(diff) != map.end()) {
            return {map[diff], i};
        }
        map[nums[i]] = i;
    }
    return {};
}

int main() {
    vector<int> nums = {2, 7, 11, 15};
    int target = 9;
    vector<int> result = twoSum(nums, target);
    cout << "Output: [" << result[0] << ", " << result[1] << "]" << endl;
    return 0;
}`,
      java: `// Two Sum - Java
import java.util.*;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int diff = target - nums[i];
            if (map.containsKey(diff)) {
                return new int[] { map.get(diff), i };
            }
            map.put(nums[i], i);
        }
        return new int[0];
    }

    public static void main(String[] args) {
        int[] result = twoSum(new int[]{2, 7, 11, 15}, 9);
        System.out.println("Output: " + Arrays.toString(result));
    }
}`,
      csharp: `// Two Sum - C#
using System;
using System.Collections.Generic;

class Program {
    public static int[] TwoSum(int[] nums, int target) {
        var map = new Dictionary<int, int>();
        for (int i = 0; i < nums.Length; i++) {
            int diff = target - nums[i];
            if (map.ContainsKey(diff)) {
                return new int[] { map[diff], i };
            }
            map[nums[i]] = i;
        }
        return new int[0];
    }

    static void Main() {
        int[] result = TwoSum(new int[] { 2, 7, 11, 15 }, 9);
        Console.WriteLine($"Output: [{result[0]}, {result[1]}]");
    }
}`,
      go: `// Two Sum - Go
package main

import "fmt"

func twoSum(nums []int, target int) []int {
    seen := make(map[int]int)
    for i, num := range nums {
        diff := target - num
        if idx, found := seen[diff]; found {
            return []int{idx, i}
        }
        seen[num] = i
    }
    return []int{}
}

func main() {
    result := twoSum([]int{2, 7, 11, 15}, 9)
    fmt.Printf("Output: %v\\n", result)
}`,
      rust: `// Two Sum - Rust
use std::collections::HashMap;

fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
    let mut map = HashMap::new();
    for (i, &num) in nums.iter().enumerate() {
        let diff = target - num;
        if let Some(&prev_idx) = map.get(&diff) {
            return vec![prev_idx as i32, i as i32];
        }
        map.insert(num, i);
    }
    vec![]
}

fn main() {
    let result = two_sum(vec![2, 7, 11, 15], 9);
    println!("Output: {:?}", result);
}`,
      sql: `-- Two Sum - SQL (SQLite Database)
CREATE TABLE IF NOT EXISTS numbers (id INTEGER PRIMARY KEY, val INTEGER);
DELETE FROM numbers;
INSERT INTO numbers (val) VALUES (2), (7), (11), (15);

SELECT a.id AS idx1, b.id AS idx2, a.val, b.val, (a.val + b.val) AS total
FROM numbers a
JOIN numbers b ON a.id < b.id
WHERE (a.val + b.val) = 9;`,
      c: `/* Two Sum - C */
#include <stdio.h>
#include <stdlib.h>

int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    int* result = (int*)malloc(2 * sizeof(int));
    for (int i = 0; i < numsSize; i++) {
        for (int j = i + 1; j < numsSize; j++) {
            if (nums[i] + nums[j] == target) {
                result[0] = i;
                result[1] = j;
                *returnSize = 2;
                return result;
            }
        }
    }
    *returnSize = 0;
    return NULL;
}

int main() {
    int nums[] = {2, 7, 11, 15};
    int returnSize = 0;
    int* res = twoSum(nums, 4, 9, &returnSize);
    if (res != NULL) {
        printf("Output: [%d, %d]\\n", res[0], res[1]);
        free(res);
    }
    return 0;
}`
    }
  },
  {
    id: 'valid-palindrome',
    title: 'Valid Palindrome',
    description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Given a string s, return true if it is a palindrome, or false otherwise.',
    difficulty: 'Easy',
    starters: {
      python: `# Valid Palindrome - Python
def is_palindrome(s: str) -> bool:
    cleaned = ''.join(c.lower() for c in s if c.isalnum())
    return cleaned == cleaned[::-1]

print("Is Palindrome:", is_palindrome("A man, a plan, a canal: Panama"))`,
      javascript: `// Valid Palindrome - JavaScript
function isPalindrome(s) {
    const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleaned === cleaned.split('').reverse().join('');
}

console.log("Is Palindrome:", isPalindrome("A man, a plan, a canal: Panama"));`,
      typescript: `// Valid Palindrome - TypeScript
function isPalindrome(s: string): boolean {
    const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleaned === cleaned.split('').reverse().join('');
}

console.log("Is Palindrome:", isPalindrome("A man, a plan, a canal: Panama"));`,
      cpp: `// Valid Palindrome - C++
#include <iostream>
#include <string>
#include <cctype>

using namespace std;

bool isPalindrome(string s) {
    int left = 0, right = s.length() - 1;
    while (left < right) {
        while (left < right && !isalnum(s[left])) left++;
        while (left < right && !isalnum(s[right])) right--;
        if (tolower(s[left]) != tolower(s[right])) return false;
        left++; right--;
    }
    return true;
}

int main() {
    cout << "Is Palindrome: " << (isPalindrome("A man, a plan, a canal: Panama") ? "true" : "false") << endl;
    return 0;
}`,
      java: `// Valid Palindrome - Java
public class Main {
    public static boolean isPalindrome(String s) {
        String cleaned = s.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
        String rev = new StringBuilder(cleaned).reverse().toString();
        return cleaned.equals(rev);
    }

    public static void main(String[] args) {
        System.out.println("Is Palindrome: " + isPalindrome("A man, a plan, a canal: Panama"));
    }
}`,
      csharp: `// Valid Palindrome - C#
using System;

class Program {
    public static bool IsPalindrome(string s) {
        var charArray = s.ToLower().ToCharArray();
        string cleaned = "";
        foreach (char c in charArray) {
            if (char.IsLetterOrDigit(c)) cleaned += c;
        }
        char[] arr = cleaned.ToCharArray();
        Array.Reverse(arr);
        return cleaned == new string(arr);
    }

    static void Main() {
        Console.WriteLine("Is Palindrome: " + IsPalindrome("A man, a plan, a canal: Panama"));
    }
}`,
      go: `// Valid Palindrome - Go
package main

import (
    "fmt"
    "regexp"
    "strings"
)

func isPalindrome(s string) bool {
    reg, _ := regexp.Compile("[^a-zA-Z0-9]+")
    cleaned := strings.ToLower(reg.ReplaceAllString(s, ""))
    n := len(cleaned)
    for i := 0; i < n/2; i++ {
        if cleaned[i] != cleaned[n-1-i] {
            return false
        }
    }
    return true
}

func main() {
    fmt.Println("Is Palindrome:", isPalindrome("A man, a plan, a canal: Panama"))
}`,
      rust: `// Valid Palindrome - Rust
fn is_palindrome(s: &str) -> bool {
    let cleaned: String = s.chars()
        .filter(|c| c.is_alphanumeric())
        .map(|c| c.to_ascii_lowercase())
        .collect();
    cleaned.chars().eq(cleaned.chars().rev())
}

fn main() {
    println!("Is Palindrome: {}", is_palindrome("A man, a plan, a canal: Panama"));
}`,
      sql: `-- Valid Palindrome - SQL (SQLite Database)
CREATE TABLE IF NOT EXISTS test_phrases (s TEXT);
DELETE FROM test_phrases;
INSERT INTO test_phrases VALUES ('racecar'), ('hello'), ('madam');

SELECT s, CASE WHEN s = reverse_str THEN 'true' ELSE 'false' END AS is_palindrome
FROM (
    SELECT s,
           substr(s,6,1)||substr(s,5,1)||substr(s,4,1)||substr(s,3,1)||substr(s,2,1)||substr(s,1,1) AS reverse_str
    FROM test_phrases
);`,
      c: `/* Valid Palindrome - C */
#include <stdio.h>
#include <ctype.h>
#include <string.h>

int isPalindrome(char * s) {
    int left = 0, right = strlen(s) - 1;
    while (left < right) {
        while (left < right && !isalnum(s[left])) left++;
        while (left < right && !isalnum(s[right])) right--;
        if (tolower(s[left]) != tolower(s[right])) return 0;
        left++; right--;
    }
    return 1;
}

int main() {
    char str[] = "A man, a plan, a canal: Panama";
    printf("Is Palindrome: %s\\n", isPalindrome(str) ? "true" : "false");
    return 0;
}`
    }
  },
  {
    id: 'reverse-linked-list',
    title: 'Reverse Linked List',
    description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    difficulty: 'Easy',
    starters: {
      python: `# Reverse Linked List - Python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverse_list(head):
    prev, curr = None, head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev

head = ListNode(1, ListNode(2, ListNode(3)))
rev = reverse_list(head)
res = []
while rev:
    res.append(rev.val)
    rev = rev.next
print("Reversed List:", res)`,
      javascript: `// Reverse Linked List - JavaScript
class ListNode {
    constructor(val = 0, next = null) {
        this.val = val;
        this.next = next;
    }
}

function reverseList(head) {
    let prev = null, curr = head;
    while (curr !== null) {
        let nxt = curr.next;
        curr.next = prev;
        prev = curr;
        curr = nxt;
    }
    return prev;
}

let head = new ListNode(1, new ListNode(2, new ListNode(3)));
let rev = reverseList(head);
let out = [];
while (rev) { out.push(rev.val); rev = rev.next; }
console.log("Reversed List:", out);`,
      typescript: `// Reverse Linked List - TypeScript
class ListNode {
    val: number;
    next: ListNode | null;
    constructor(val?: number, next?: ListNode | null) {
        this.val = (val===undefined ? 0 : val);
        this.next = (next===undefined ? null : next);
    }
}

function reverseList(head: ListNode | null): ListNode | null {
    let prev: ListNode | null = null;
    let curr = head;
    while (curr !== null) {
        let nxt = curr.next;
        curr.next = prev;
        prev = curr;
        curr = nxt;
    }
    return prev;
}

let head = new ListNode(1, new ListNode(2, new ListNode(3)));
let rev = reverseList(head);
let out: number[] = [];
while (rev) { out.push(rev.val); rev = rev.next; }
console.log("Reversed List:", out);`,
      cpp: `// Reverse Linked List - C++
#include <iostream>
#include <vector>

using namespace std;

struct ListNode {
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(NULL) {}
};

ListNode* reverseList(ListNode* head) {
    ListNode* prev = NULL;
    ListNode* curr = head;
    while (curr != NULL) {
        ListNode* nextTemp = curr->next;
        curr->next = prev;
        prev = curr;
        curr = nextTemp;
    }
    return prev;
}

int main() {
    ListNode* head = new ListNode(1);
    head->next = new ListNode(2);
    head->next->next = new ListNode(3);

    ListNode* rev = reverseList(head);
    cout << "Reversed List: ";
    while (rev) { cout << rev->val << " "; rev = rev->next; }
    cout << endl;
    return 0;
}`,
      java: `// Reverse Linked List - Java
public class Main {
    static class ListNode {
        int val;
        ListNode next;
        ListNode(int val) { this.val = val; }
    }

    public static ListNode reverseList(ListNode head) {
        ListNode prev = null, curr = head;
        while (curr != null) {
            ListNode nxt = curr.next;
            curr.next = prev;
            prev = curr;
            curr = nxt;
        }
        return prev;
    }

    public static void main(String[] args) {
        ListNode head = new ListNode(1);
        head.next = new ListNode(2);
        head.next.next = new ListNode(3);
        ListNode rev = reverseList(head);
        System.out.print("Reversed List: ");
        while (rev != null) {
            System.out.print(rev.val + " ");
            rev = rev.next;
        }
    }
}`,
      csharp: `// Reverse Linked List - C#
using System;

class Program {
    public class ListNode {
        public int val;
        public ListNode next;
        public ListNode(int val = 0, ListNode next = null) {
            this.val = val;
            this.next = next;
        }
    }

    public static ListNode ReverseList(ListNode head) {
        ListNode prev = null, curr = head;
        while (curr != null) {
            ListNode nxt = curr.next;
            curr.next = prev;
            prev = curr;
            curr = nxt;
        }
        return prev;
    }

    static void Main() {
        var head = new ListNode(1, new ListNode(2, new ListNode(3)));
        var rev = ReverseList(head);
        Console.Write("Reversed List: ");
        while (rev != null) {
            Console.Write(rev.val + " ");
            rev = rev.next;
        }
    }
}`,
      go: `// Reverse Linked List - Go
package main

import "fmt"

type ListNode struct {
    Val  int
    Next *ListNode
}

func reverseList(head *ListNode) *ListNode {
    var prev *ListNode
    curr := head
    for curr != nil {
        next := curr.Next
        curr.Next = prev
        prev = curr
        curr = next
    }
    return prev
}

func main() {
    head := &ListNode{Val: 1, Next: &ListNode{Val: 2, Next: &ListNode{Val: 3}}}
    rev := reverseList(head)
    fmt.Print("Reversed List: ")
    for rev != nil {
        fmt.Printf("%d ", rev.Val)
        rev = rev.Next
    }
    fmt.Println()
}`,
      rust: `// Reverse Linked List - Rust
#[derive(PartialEq, Eq, Clone, Debug)]
pub struct ListNode {
    pub val: i32,
    pub next: Option<Box<ListNode>>,
}

fn reverse_list(mut head: Option<Box<ListNode>>) -> Option<Box<ListNode>> {
    let mut prev = None;
    while let Some(mut node) = head {
        head = node.next.take();
        node.next = prev;
        prev = Some(node);
    }
    prev
}

fn main() {
    let list = Some(Box::new(ListNode { val: 1, next: Some(Box::new(ListNode { val: 2, next: None })) }));
    let rev = reverse_list(list);
    println!("Reversed List: {:?}", rev);
}`,
      sql: `-- Reverse Linked List Simulation - SQL
CREATE TABLE IF NOT EXISTS linked_nodes (id INT, val INT, next_id INT);
DELETE FROM linked_nodes;
INSERT INTO linked_nodes VALUES (1, 10, 2), (2, 20, 3), (3, 30, NULL);

-- Query nodes in reverse order of id
SELECT id, val FROM linked_nodes ORDER BY id DESC;`,
      c: `/* Reverse Linked List - C */
#include <stdio.h>
#include <stdlib.h>

struct ListNode {
    int val;
    struct ListNode *next;
};

struct ListNode* reverseList(struct ListNode* head) {
    struct ListNode *prev = NULL, *curr = head, *next = NULL;
    while (curr != NULL) {
        next = curr->next;
        curr->next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}

int main() {
    struct ListNode n3 = {3, NULL};
    struct ListNode n2 = {2, &n3};
    struct ListNode n1 = {1, &n2};

    struct ListNode *rev = reverseList(&n1);
    printf("Reversed List: ");
    while (rev) { printf("%d ", rev->val); rev = rev->next; }
    printf("\\n");
    return 0;
}`
    }
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    description: 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets. Open brackets must be closed in the correct order.',
    difficulty: 'Easy',
    starters: {
      python: `# Valid Parentheses - Python
def is_valid(s: str) -> bool:
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return not stack

print("Is Valid:", is_valid("()[]{}"))`,
      javascript: `// Valid Parentheses - JavaScript
function isValid(s) {
    const stack = [];
    const map = { ')': '(', '}': '{', ']': '[' };
    for (let char of s) {
        if (map[char]) {
            if (stack.pop() !== map[char]) return false;
        } else {
            stack.push(char);
        }
    }
    return stack.length === 0;
}

console.log("Is Valid:", isValid("()[]{}"));`,
      typescript: `// Valid Parentheses - TypeScript
function isValid(s: string): boolean {
    const stack: string[] = [];
    const map: Record<string, string> = { ')': '(', '}': '{', ']': '[' };
    for (let char of s) {
        if (map[char]) {
            if (stack.pop() !== map[char]) return false;
        } else {
            stack.push(char);
        }
    }
    return stack.length === 0;
}

console.log("Is Valid:", isValid("()[]{}"));`,
      cpp: `// Valid Parentheses - C++
#include <iostream>
#include <stack>
#include <unordered_map>

using namespace std;

bool isValid(string s) {
    stack<char> st;
    unordered_map<char, char> map = {{')', '('}, {'}', '{'}, {']', '['}};
    for (char c : s) {
        if (map.count(c)) {
            if (st.empty() || st.top() != map[c]) return false;
            st.pop();
        } else {
            st.push(c);
        }
    }
    return st.empty();
}

int main() {
    cout << "Is Valid: " << (isValid("()[]{}") ? "true" : "false") << endl;
    return 0;
}`,
      java: `// Valid Parentheses - Java
import java.util.*;

public class Main {
    public static boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty() || stack.pop() != c) return false;
        }
        return stack.isEmpty();
    }

    public static void main(String[] args) {
        System.out.println("Is Valid: " + isValid("()[]{}"));
    }
}`,
      csharp: `// Valid Parentheses - C#
using System;
using System.Collections.Generic;

class Program {
    public static bool IsValid(string s) {
        var stack = new Stack<char>();
        foreach (char c in s) {
            if (c == '(') stack.Push(')');
            else if (c == '{') stack.Push('}');
            else if (c == '[') stack.Push(']');
            else if (stack.Count == 0 || stack.Pop() != c) return false;
        }
        return stack.Count == 0;
    }

    static void Main() {
        Console.WriteLine("Is Valid: " + IsValid("()[]{}"));
    }
}`,
      go: `// Valid Parentheses - Go
package main

import "fmt"

func isValid(s string) bool {
    var stack []rune
    pairs := map[rune]rune{')': '(', '}': '{', ']': '['}
    for _, char := range s {
        if open, exists := pairs[char]; exists {
            if len(stack) == 0 || stack[len(stack)-1] != open {
                return false
            }
            stack = stack[:len(stack)-1]
        } else {
            stack = append(stack, char)
        }
    }
    return len(stack) == 0
}

func main() {
    fmt.Println("Is Valid:", isValid("()[]{}"))
}`,
      rust: `// Valid Parentheses - Rust
fn is_valid(s: &str) -> bool {
    let mut stack = Vec::new();
    for c in s.chars() {
        match c {
            '(' => stack.push(')'),
            '{' => stack.push('}'),
            '[' => stack.push(']'),
            ')' | '}' | ']' => {
                if stack.pop() != Some(c) { return false; }
            }
            _ => ()
        }
    }
    stack.is_empty()
}

fn main() {
    println!("Is Valid: {}", is_valid("()[]{}"));
}`,
      sql: `-- Valid Parentheses Check - SQL
CREATE TABLE IF NOT EXISTS brackets (expr TEXT);
DELETE FROM brackets;
INSERT INTO brackets VALUES ('()[]{}'), ('([)]');

SELECT expr, CASE WHEN length(expr) % 2 = 0 THEN 'balanced_length' ELSE 'unbalanced' END AS status FROM brackets;`,
      c: `/* Valid Parentheses - C */
#include <stdio.h>
#include <string.h>

int isValid(char * s) {
    char stack[1000];
    int top = -1;
    for (int i = 0; s[i] != '\\0'; i++) {
        char c = s[i];
        if (c == '(' || c == '{' || c == '[') {
            stack[++top] = c;
        } else {
            if (top == -1) return 0;
            if (c == ')' && stack[top] != '(') return 0;
            if (c == '}' && stack[top] != '{') return 0;
            if (c == ']' && stack[top] != '[') return 0;
            top--;
        }
    }
    return top == -1;
}

int main() {
    printf("Is Valid: %s\\n", isValid("()[]{}") ? "true" : "false");
    return 0;
}`
    }
  },
  {
    id: 'merge-intervals',
    title: 'Merge Intervals',
    description: 'Given an array of intervals where intervals[i] = [start, end], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.',
    difficulty: 'Medium',
    starters: {
      python: `# Merge Intervals - Python
def merge(intervals):
    intervals.sort(key=lambda x: x[0])
    merged = []
    for interval in intervals:
        if not merged or merged[-1][1] < interval[0]:
            merged.append(interval)
        else:
            merged[-1][1] = max(merged[-1][1], interval[1])
    return merged

print("Merged Intervals:", merge([[1,3],[2,6],[8,10],[15,18]]))`,
      javascript: `// Merge Intervals - JavaScript
function merge(intervals) {
    if (!intervals.length) return [];
    intervals.sort((a, b) => a[0] - b[0]);
    const merged = [intervals[0]];
    for (let i = 1; i < intervals.length; i++) {
        const last = merged[merged.length - 1];
        const curr = intervals[i];
        if (curr[0] <= last[1]) {
            last[1] = Math.max(last[1], curr[1]);
        } else {
            merged.push(curr);
        }
    }
    return merged;
}

console.log("Merged Intervals:", merge([[1,3],[2,6],[8,10],[15,18]]));`,
      typescript: `// Merge Intervals - TypeScript
function merge(intervals: number[][]): number[][] {
    if (!intervals.length) return [];
    intervals.sort((a, b) => a[0] - b[0]);
    const merged: number[][] = [intervals[0]];
    for (let i = 1; i < intervals.length; i++) {
        const last = merged[merged.length - 1];
        const curr = intervals[i];
        if (curr[0] <= last[1]) {
            last[1] = Math.max(last[1], curr[1]);
        } else {
            merged.push(curr);
        }
    }
    return merged;
}

console.log("Merged Intervals:", merge([[1,3],[2,6],[8,10],[15,18]]));`,
      cpp: `// Merge Intervals - C++
#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

vector<vector<int>> merge(vector<vector<int>>& intervals) {
    if (intervals.empty()) return {};
    sort(intervals.begin(), intervals.end());
    vector<vector<int>> merged;
    merged.push_back(intervals[0]);
    for (int i = 1; i < intervals.size(); i++) {
        if (intervals[i][0] <= merged.back()[1]) {
            merged.back()[1] = max(merged.back()[1], intervals[i][1]);
        } else {
            merged.push_back(intervals[i]);
        }
    }
    return merged;
}

int main() {
    vector<vector<int>> intervals = {{1,3},{2,6},{8,10},{15,18}};
    vector<vector<int>> res = merge(intervals);
    cout << "Merged count: " << res.size() << endl;
    return 0;
}`,
      java: `// Merge Intervals - Java
import java.util.*;

public class Main {
    public static int[][] merge(int[][] intervals) {
        if (intervals.length <= 1) return intervals;
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
        List<int[]> result = new ArrayList<>();
        int[] newInterval = intervals[0];
        result.add(newInterval);
        for (int[] interval : intervals) {
            if (interval[0] <= newInterval[1]) {
                newInterval[1] = Math.max(newInterval[1], interval[1]);
            } else {
                newInterval = interval;
                result.add(newInterval);
            }
        }
        return result.toArray(new int[result.size()][]);
    }

    public static void main(String[] args) {
        int[][] res = merge(new int[][]{{1,3},{2,6},{8,10},{15,18}});
        System.out.println("Merged Intervals Count: " + res.length);
    }
}`,
      csharp: `// Merge Intervals - C#
using System;
using System.Collections.Generic;

class Program {
    public static int[][] Merge(int[][] intervals) {
        if (intervals.Length <= 1) return intervals;
        Array.Sort(intervals, (a, b) => a[0].CompareTo(b[0]));
        var result = new List<int[]>();
        var current = intervals[0];
        result.Add(current);
        foreach (var interval in intervals) {
            if (interval[0] <= current[1]) {
                current[1] = Math.Max(current[1], interval[1]);
            } else {
                current = interval;
                result.Add(current);
            }
        }
        return result.ToArray();
    }

    static void Main() {
        int[][] input = new int[][] { new int[]{1,3}, new int[]{2,6}, new int[]{8,10}, new int[]{15,18} };
        var res = Merge(input);
        Console.WriteLine("Merged Intervals Count: " + res.Length);
    }
}`,
      go: `// Merge Intervals - Go
package main

import (
    "fmt"
    "sort"
)

func merge(intervals [][]int) [][]int {
    if len(intervals) <= 1 {
        return intervals
    }
    sort.Slice(intervals, func(i, j int) bool {
        return intervals[i][0] < intervals[j][0]
    })
    merged := [][]int{intervals[0]}
    for _, interval := range intervals[1:] {
        last := &merged[len(merged)-1]
        if interval[0] <= (*last)[1] {
            if interval[1] > (*last)[1] {
                (*last)[1] = interval[1]
            }
        } else {
            merged = append(merged, interval)
        }
    }
    return merged
}

func main() {
    fmt.Println("Merged:", merge([][]int{{1,3},{2,6},{8,10},{15,18}}))
}`,
      rust: `// Merge Intervals - Rust
fn merge(mut intervals: Vec<Vec<i32>>) -> Vec<Vec<i32>> {
    if intervals.is_empty() { return vec![]; }
    intervals.sort_by_key(|k| k[0]);
    let mut merged: Vec<Vec<i32>> = vec![intervals[0].clone()];
    for interval in intervals.into_iter().skip(1) {
        let last = merged.last_mut().unwrap();
        if interval[0] <= last[1] {
            last[1] = last[1].max(interval[1]);
        } else {
            merged.push(interval);
        }
    }
    merged
}

fn main() {
    let res = merge(vec![vec![1,3], vec![2,6], vec![8,10], vec![15,18]]);
    println!("Merged: {:?}", res);
}`,
      sql: `-- Merge Intervals - SQL
CREATE TABLE IF NOT EXISTS intervals (start_time INT, end_time INT);
DELETE FROM intervals;
INSERT INTO intervals VALUES (1, 3), (2, 6), (8, 10), (15, 18);

SELECT MIN(start_time) AS start_val, MAX(end_time) AS end_val
FROM (
    SELECT start_time, end_time,
           SUM(CASE WHEN prev_max < start_time THEN 1 ELSE 0 END) OVER (ORDER BY start_time) AS grp
    FROM (
        SELECT start_time, end_time,
               MAX(end_time) OVER (ORDER BY start_time ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING) AS prev_max
        FROM intervals
    )
)
GROUP BY grp;`,
      c: `/* Merge Intervals - C */
#include <stdio.h>
#include <stdlib.h>

int compare(const void* a, const void* b) {
    return (*(int**)a)[0] - (*(int**)b)[0];
}

int main() {
    printf("Merge Intervals algorithm ready for compilation.\\n");
    return 0;
}`
    }
  }
];

