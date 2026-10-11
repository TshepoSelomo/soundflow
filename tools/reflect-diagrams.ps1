$ide = 'C:\Program Files (x86)\Microsoft SQL Server Management Studio 18\Common7\IDE'
[AppDomain]::CurrentDomain.add_AssemblyResolve({
  param($s, $e)
  $name = ($e.Name -split ',')[0] + '.dll'
  $path = Join-Path $ide $name
  if (Test-Path $path) { return [Reflection.Assembly]::LoadFrom($path) }
  return $null
})
$asm = [Reflection.Assembly]::LoadFrom((Join-Path $ide 'Microsoft.SqlServer.Management.DataTools.dll'))
$types = @()
try {
  $types = $asm.GetTypes()
} catch [System.Reflection.ReflectionTypeLoadException] {
  Write-Host 'PARTIAL LOAD'
  $types = $_.Exception.Types | Where-Object { $_ }
  $_.Exception.LoaderExceptions | Select-Object -First 8 | ForEach-Object { Write-Host $_.Message }
}
$types | Where-Object { $_.FullName -match 'Diagram' } | ForEach-Object { $_.FullName }
