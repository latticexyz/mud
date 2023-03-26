#! usr/bin/bash
giturl=https://github.com/$1.git
head=$(git ls-remote $giturl HEAD | head -n1 | awk '{print $1;}')
pnpm add $giturl#$head
echo "Installed $giturl#$head"