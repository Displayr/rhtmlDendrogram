{ pkgs ? import <nixpkgs> {}, displayrUtils }:

pkgs.rPackages.buildRPackage {
  name = "rhtmlDendrogram";
  version = displayrUtils.extractRVersion (builtins.readFile ./DESCRIPTION); 
  src = ./.;
  description = ''
    More about what it does (maybe more than one line)
    Use four spaces when indenting paragraphs within the Description.
  '';
}
