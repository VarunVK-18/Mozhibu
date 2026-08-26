import re

with open('Frontend/src/app/features/story/components/comment-list/comment-list.component.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Extract the comment thread HTML
start_thread = content.find('<div class="comment-thread"')
# Find the end of the comment thread, which is before the closing brace of the @for loop.
# It ends at line 265: `</div>\n        }`
end_thread = content.find('</div>\n        }\n      </div>', start_thread)
comment_thread_html = content[start_thread:end_thread + 6] # include the </div> of comment-thread

# 2. Replace the tabs and list with the new grid layout
start_replace = content.find('<!-- Sort Navigation -->')
end_replace = content.find('      </div>\n    </div>\n  `,\n  styles: [')

new_html = f"""<!-- Comment Thread Template -->
      <ng-template #commentThread let-comment>
        {comment_thread_html}
      </ng-template>

      <!-- Sort Navigation -->
      <div class="reviews-tabs">
        <div class="right-sort" style="margin-left: auto;">
          <span class="sort-label">Sort by:</span>
          <select [(ngModel)]="sortOrder" class="sort-select">
            <option value="popular">Top</option>
            <option value="newest">Recent</option>
          </select>
        </div>
      </div>

      <!-- Comments and Reviews Grid -->
      <div class="comments-reviews-grid">
        <!-- Left: Comments -->
        <div class="comments-column">
          <h3 class="column-title">Comments ({{{{ unratedComments.length }}}})</h3>
          <div class="comments-list">
            @for (comment of sortedUnratedComments; track comment.id) {{
              <ng-container *ngTemplateOutlet="commentThread; context: {{ $implicit: comment }}"></ng-container>
            }}
          </div>
        </div>
        
        <!-- Right: Reviews -->
        <div class="reviews-column">
          <h3 class="column-title">Reviews ({{{{ ratedComments.length }}}})</h3>
          <div class="comments-list">
            @for (comment of sortedRatedComments; track comment.id) {{
              <ng-container *ngTemplateOutlet="commentThread; context: {{ $implicit: comment }}"></ng-container>
            }}
          </div>
        </div>
      </div>"""

content = content[:start_replace] + new_html + content[end_replace:]

# 3. Add CSS for the grid layout
start_styles = content.find('/* Ratings Dashboard Styles */')
css = """/* Two Column Grid Styles */
    .comments-reviews-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
    }
    .column-title {
      font-family: var(--display);
      font-size: 20px;
      color: var(--ink);
      margin-bottom: 24px;
      padding-bottom: 8px;
      border-bottom: 2px solid var(--border-soft);
    }
    @media (max-width: 900px) {
      .comments-reviews-grid {
        grid-template-columns: 1fr;
      }
    }
    
    """
content = content[:start_styles] + css + content[start_styles:]

# 4. Remove viewMode and update sortedComments logic
content = content.replace("viewMode: 'reviews' | 'comments' = 'reviews';", "")

sorted_logic_old = """  get sortedComments() {
    let source = this.viewMode === 'reviews' ? this.ratedComments : this.unratedComments;
    let sorted = [...source];
    
    if (this.sortOrder === 'newest') {
      sorted.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } else if (this.sortOrder === 'popular') {
      sorted.sort((a, b) => b.likes - a.likes);
    }
    
    // Always keep pinned comments at top
    sorted.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
    
    return sorted;
  }"""

sorted_logic_new = """  get sortedUnratedComments() {
    return this.sortList(this.unratedComments);
  }
  
  get sortedRatedComments() {
    return this.sortList(this.ratedComments);
  }

  private sortList(source: any[]) {
    let sorted = [...source];
    
    if (this.sortOrder === 'newest') {
      sorted.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } else if (this.sortOrder === 'popular') {
      sorted.sort((a, b) => b.likes - a.likes);
    }
    
    // Always keep pinned comments at top
    sorted.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
    
    return sorted;
  }"""

content = content.replace(sorted_logic_old, sorted_logic_new)

# Update submitComment to figure out rating ToSubmit
submit_old = """    if (this.newCommentText.trim()) {
      const ratingToSubmit = this.viewMode === 'reviews' ? this.newRating : 0;
      this.postComment.emit({text: this.newCommentText.trim(), rating: ratingToSubmit});"""

submit_new = """    if (this.newCommentText.trim()) {
      // If user selected a rating > 0, we consider it a review, otherwise a comment.
      const ratingToSubmit = this.newRating;
      this.postComment.emit({text: this.newCommentText.trim(), rating: ratingToSubmit});"""
content = content.replace(submit_old, submit_new)

# Update the Write Review/Comment UI to use newRating instead of viewMode
input_old = """@if ((isFocused || newCommentText.trim().length > 0) && viewMode === 'reviews') {"""
input_new = """@if (isFocused || newCommentText.trim().length > 0) {"""
content = content.replace(input_old, input_new)

input_old2 = """[placeholder]="viewMode === 'reviews' ? 'Write a review...' : 'Write a comment...'\""""
input_new2 = """[placeholder]="'Write a review (with rating) or a comment...'\""""
content = content.replace(input_old2, input_new2)

input_old3 = """{{ viewMode === 'reviews' ? 'Post Review' : 'Post Comment' }}"""
input_new3 = """{{ newRating > 0 ? 'Post Review' : 'Post Comment' }}"""
content = content.replace(input_old3, input_new3)

with open('Frontend/src/app/features/story/components/comment-list/comment-list.component.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
