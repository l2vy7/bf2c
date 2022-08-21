{ pkgs }: {
	deps = [
		pkgs.llvmPackages_rocm.llvm
  pkgs.llvmPackages_8.clangUseLLVM
  pkgs.nodejs-16_x
        pkgs.nodePackages.typescript-language-server
        pkgs.yarn
        pkgs.replitPackages.jest
	];
}