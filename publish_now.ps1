# Commit locally if any changes, push main, build, then update gh-pages worktree
$changes = (git status --porcelain)
Write-Output "Git status lines: $changes"
if ($changes -ne '') {
  Write-Output 'Staging changes...'
  git add -A
  git commit -m "chore(publish): commit latest changes and publish" || Write-Output 'Commit returned non-zero'
  Write-Output 'Pushing main to origin...'
  git push origin main
} else {
  Write-Output 'No changes to commit.'
}

Write-Output 'Running production build...'
npm run build

Write-Output 'Updating gh-pages worktree with dist...'
Get-ChildItem -Force .\gh-pages | Where-Object { $_.Name -ne '.git' } | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path .\dist\* -Destination .\gh-pages -Recurse -Force
git -C .\gh-pages add -A
$null = git -C .\gh-pages commit -m "deploy: publish dist to gh-pages" -q 2>&1
Write-Output 'Pushing gh-pages to origin (force)...'
git -C .\gh-pages push origin gh-pages --force

Write-Output 'Done. Check https://nivedh-cloud.github.io/The-Wisdom-Mountain/'
