#!/bin/sh

# Read the current version from package.json
current_version=$(grep -o '"version": "[^"]*' package.json | grep -o '[0-9.]*')
echo "current version: $current_version"

# Split the version into major, minor, and patch
IFS='.' read -r major minor patch <<< "$current_version"

# Increment the patch version or minor version
patch=$((patch + 1))
if ((patch > 99)); then
  patch=0
  minor=$((minor + 1))
fi

# Construct the new version
new_version="$major.$minor.$patch"


# Update the package.json with the new version
sed -i '' "s/\"version\": \"$current_version\"/\"version\": \"$new_version\"/" package.json

echo "updated version: $new_version"

npm run build && npm publish --access public