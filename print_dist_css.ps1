$a = Get-Content "dist\assets\index-7-MYNkpE.css"
for($i=860; $i -le 920; $i++){
  $ln = $i + 1
  Write-Output ("{0}: {1}" -f $ln, $a[$i])
}
