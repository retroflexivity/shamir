#!/usr/bin/env nu

cd public
let filenames = ls **/* | where type == file | get name | path parse | enumerate | flatten
  | insert newname {
    {parent: "images", stem: ($in.index | into string), extension: $in.extension} | path join
  }
  | insert oldname {select parent extension stem | path join}
  | select oldname newname

$filenames | each {|row| mv $row.oldname $row.newname}

cd ../src/content/articles/

def escape [] {
  str replace --all '/' '\/' | str replace --all '.' '\.'
}

$filenames | update oldname { escape } | update newname { escape }
  | each { sed -i $'s/($in.oldname)/($in.newname)/g' *.md }
